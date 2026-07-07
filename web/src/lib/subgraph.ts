import { NFT, Metadata, NftMinted } from "@/types";

const NFT_MINTEDS_QUERY = `
  query NftMinteds($first: Int!, $creator: String) {
    nftMinteds(
      first: $first
      orderBy: blockTimestamp
      orderDirection: desc
      where: { creator: $creator }
    ) {
      id
      tokenId
      creator
      supply
      cid
      blockNumber
      blockTimestamp
    }
  }
`;

const NFT_MINTED_BY_TOKEN_ID_QUERY = `
  query NftMintedByTokenId($tokenId: BigInt!) {
    nftMinteds(where: { tokenId: $tokenId }, first: 1) {
      id
      tokenId
      creator
      supply
      cid
      blockNumber
      blockTimestamp
    }
  }
`;

export type QueryNftMintedsParams = {
  creator?: string;
  limit?: number;
};

/**
 * Fetches the most recent NftMinted events from the configured subgraph.
 *
 * Throws on transport, HTTP, or GraphQL `errors` so callers can decide their
 * own UX. Returns an empty array when the subgraph responds with no data.
 */
export const queryNftMinteds = async ({
  creator,
  limit = 10,
}: QueryNftMintedsParams = {}): Promise<NftMinted[]> => {
  const endpoint = process.env.NEXT_PUBLIC_SUBGRAPH_API;
  if (!endpoint) {
    throw new Error("NEXT_PUBLIC_SUBGRAPH_API is not configured");
  }

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: NFT_MINTEDS_QUERY,
      variables: { first: limit, creator: creator ?? null },
    }),
  });

  if (!res.ok) {
    throw new Error(`Subgraph request failed: ${res.status} ${res.statusText}`);
  }

  const payload = (await res.json()) as {
    data?: { nftMinteds: NftMinted[] };
    errors?: Array<{ message: string }>;
  };

  if (payload.errors?.length) {
    throw new Error(payload.errors.map((e) => e.message).join("; "));
  }

  return payload.data?.nftMinteds ?? [];
};

/**
 * Fetches a single NftMinted entity by its on-chain `tokenId`.
 *
 * Returns `null` when the subgraph has no record for the given tokenId. Throws
 * on transport / HTTP errors so callers can show an error UI instead of an
 * infinite spinner.
 */
export const queryNftMintedByTokenId = async (
  tokenId: string,
): Promise<NftMinted | null> => {
  const endpoint = process.env.NEXT_PUBLIC_SUBGRAPH_API;
  if (!endpoint) {
    throw new Error("NEXT_PUBLIC_SUBGRAPH_API is not configured");
  }

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: NFT_MINTED_BY_TOKEN_ID_QUERY,
      variables: { tokenId },
    }),
  });

  if (!res.ok) {
    throw new Error(`Subgraph request failed: ${res.status} ${res.statusText}`);
  }

  const payload = (await res.json()) as {
    data?: { nftMinteds: NftMinted[] };
    errors?: Array<{ message: string }>;
  };

  if (payload.errors?.length) {
    throw new Error(payload.errors.map((e) => e.message).join("; "));
  }

  return payload.data?.nftMinteds?.[0] ?? null;
};

/**
 * Fetches the on-chain metadata JSON for an NFT from the local CID proxy.
 *
 * The mint route writes metadata with `image` already pointing at this proxy
 * (see `web/src/app/api/mint/route.ts`), so going through the same proxy keeps
 * the returned `image` URL renderable as-is by `NftContainer`.
 *
 * Returns `null` when the env is missing, the response is not OK, or the body
 * is not valid JSON — callers should fall back to placeholder fields.
 */
export const fetchNftMetadata = async (
  cid: string,
): Promise<Partial<Metadata> | null> => {
  const host = process.env.NEXT_PUBLIC_HOST;
  const network = process.env.NEXT_PUBLIC_NETWORK;
  if (!host || !network || !cid) return null;

  try {
    const res = await fetch(`${host}/api/cid/${network}/${cid}`);
    if (!res.ok) return null;
    const data = (await res.json()) as Partial<Metadata>;
    return data;
  } catch (error) {
    console.error("Failed to fetch NFT metadata", { cid, error });
    return null;
  }
};

/**
 * Maps a raw subgraph NftMinted entity to the UI-facing NFT shape.
 *
 * Fetches the on-chain metadata JSON (written at mint time) and uses its
 * `image`, `name`, and `description`. Falls back to per-field placeholders
 * when metadata is unavailable so a single missing entry never blanks the
 * whole list.
 */
export const mapNftMintedToNft = async (item: NftMinted): Promise<NFT> => {
  const metadata = await fetchNftMetadata(item.cid);

  return {
    id: item.id,
    image: metadata?.image ?? "",
    name: metadata?.name ?? `NFT #${item.tokenId}`,
    description: metadata?.description ?? `Created by ${item.creator}`,
    creator: item.creator,
    quantity: item.supply,
    cid: item.cid,
    tokenId: String(item.tokenId),
  } satisfies NFT;
};

/**
 * Fetches and maps a list of NftMinted entities to UI-facing NFTs.
 *
 * Resolves metadata in parallel; missing metadata falls back to per-NFT
 * placeholders so a single failure cannot blank the list. An empty list is
 * returned when the subgraph has no matching events (distinct from a thrown
 * subgraph error).
 */
export const fetchAndMapNfts = async (
  params: QueryNftMintedsParams = {},
): Promise<NFT[]> => {
  const items = await queryNftMinteds(params);
  return Promise.all(items.map(mapNftMintedToNft));
};