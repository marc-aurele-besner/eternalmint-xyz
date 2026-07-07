import { request } from "graphql-request";
import { NFT, NftMinted } from "@/types";

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
 * Maps a raw subgraph NftMinted entity to the UI-facing NFT shape.
 */
export const mapNftMintedToNft = (item: NftMinted): NFT => ({
  id: item.id,
  image: `https://images.pexels.com/photos/${item.tokenId}/pexels-photo-${item.tokenId}.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260`,
  name: `NFT ${item.tokenId}`,
  description: `Created by ${item.creator}`,
  creator: item.creator,
  quantity: item.supply,
  cid: item.cid,
});