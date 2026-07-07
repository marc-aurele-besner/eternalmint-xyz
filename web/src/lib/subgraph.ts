import { request } from "graphql-request";
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

export type QueryNftMintedsParams = {
  creator?: string;
  limit?: number;
};

/**
 * Fetches the most recent NftMinted events from the configured subgraph.
 *
 * Throws on transport or HTTP errors so callers can decide their own UX.
 * Returns an empty array when the subgraph responds with no data.
 */
export const queryNftMinteds = async ({
  creator,
  limit = 10,
}: QueryNftMintedsParams = {}): Promise<NftMinted[]> => {
  const endpoint = process.env.NEXT_PUBLIC_SUBGRAPH_API;
  if (!endpoint) {
    throw new Error("NEXT_PUBLIC_SUBGRAPH_API is not configured");
  }

  const data = await request<{ nftMinteds: NftMinted[] }>(
    endpoint,
    NFT_MINTEDS_QUERY,
    { first: limit, creator: creator ?? null },
  );

  return data?.nftMinteds ?? [];
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
  };
};