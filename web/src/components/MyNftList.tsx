"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { NFT } from "../types";
import { mapNftMintedToNft, queryNftMinteds } from "../lib/subgraph";
import { NftContainer } from "./NftContainer";

export const MyNftList: React.FC = () => {
  const { address } = useAccount();
  const [nfts, setNfts] = useState<NFT[]>([]);

  useEffect(() => {
    const fetchNFTs = async () => {
      const items = await queryNftMinteds({ creator: address });
      setNfts(
        await Promise.all(
          items.map(async (item) => ({
            ...(await mapNftMintedToNft(item)),
            tokenId: String(item.tokenId),
          })),
        ),
      );
    };

    fetchNFTs();
  }, [address]);

  return (
    <div className="mt-8 mb-4">
      <h2 className="text-2xl font-bold mb-4">My NFTs Created</h2>
      <ul className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {nfts.map((nft) => (
          <NftContainer key={nft.id} nft={nft} showTransferButton />
        ))}
      </ul>
    </div>
  );
};