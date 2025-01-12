"use client";

import { useEffect, useState } from "react";
import { NFT, NftMinted } from "../types";
import { NftContainer } from "./NftContainer";

export const LatestNFTList: React.FC = () => {
  const [nfts, setNfts] = useState<NFT[]>([]);

  useEffect(() => {
    const fetchNFTs = async () => {
      const response = await fetch(process.env.NEXT_PUBLIC_SUBGRAPH_API!, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: `
            query {
              nftMinteds(first: 10, orderBy: blockTimestamp, orderDirection: desc) {
                id
                tokenId
                creator
                supply
                cid
                blockNumber
                blockTimestamp
              }
            }
          `,
        }),
      });
      const { data } = await response.json();
      console.log("data", data);
      const transformedNfts = data.nftMinteds.map((item: NftMinted) => ({
        id: item.id,
        image: `https://images.pexels.com/photos/${item.tokenId}/pexels-photo-${item.tokenId}.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260`,
        name: `NFT ${item.tokenId}`,
        description: `Created by ${item.creator}`,
        quantity: item.supply,
        cid: item.cid,
      }));
      setNfts(transformedNfts);
    };

    fetchNFTs();
  }, []);

  return (
    <div className="mt-8 mb-4">
      <h2 className="text-2xl font-bold mb-4">Latest NFTs Created</h2>
      <ul className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {nfts.map((nft) => (
          <NftContainer key={nft.id} nft={nft} />
        ))}
      </ul>
    </div>
  );
};
