"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAccount } from "wagmi";
import { Metadata, NFT } from "../types";

export const NftContainer: React.FC<{ nft: NFT }> = ({ nft }) => {
  console.log("nft", nft);
  const { address } = useAccount();
  const [metadata, setMetadata] = useState<Metadata | null>(null);

  const handleLoadMetadata = useCallback(async (cid: string) => {
    try {
      const res = await fetch(`/api/cid/taurus/${cid}`);
      const metadata = await res.json();
      console.log("metadata", metadata);
      const imageCID = metadata.image.substring(
        metadata.image.lastIndexOf("/") + 1
      );
      return {
        ...metadata,
        image: metadata.image
          .replace("http://localhost:[0-9]+", process.env.NEXT_PUBLIC_HOST)
          .replace("//api", "/api"),
      };
    } catch (error) {
      console.error("Error loading metadata", error);
      throw error;
    }
  }, []);

  const handleLoadMetadataWithFallback = useCallback(
    async (cid: string) => {
      try {
        const metadata = await handleLoadMetadata(cid);
        console.log("metadata", metadata);
        setMetadata(metadata);
      } catch (error) {
        console.error("Error loading metadata", error);
        await new Promise((resolve) => setTimeout(resolve, 500));
        try {
          const metadata = await handleLoadMetadata(cid);
          console.log("metadata", metadata);
          setMetadata(metadata);
        } catch (error) {
          console.error("Error loading metadata a second time", error);
        }
      }
    },
    [handleLoadMetadata]
  );

  const metadataCid = useMemo(
    () => (nft && nft.cid ? nft.cid.split("/").pop() : null),
    [nft]
  );

  const imageCid = useMemo(
    () => (metadata && metadata.image ? metadata.image.split("/").pop() : null),
    [metadata]
  );

  useEffect(() => {
    if (metadataCid) handleLoadMetadataWithFallback(metadataCid);
  }, [metadataCid, handleLoadMetadataWithFallback]);

  return (
    <li
      key={nft.id}
      className="flex flex-row items-start gap-6 p-4 rounded-xl shadow-lg border border-white/15 backdrop-filter backdrop-blur-md"
    >
      <Image
        src={metadata?.image ?? ""}
        alt={metadata?.name ?? ""}
        className="w-20 h-24 rounded-lg"
        width={640}
        height={256}
        unoptimized
      />
      <div>
        <h3 className="text-xl font-semibold">{metadata?.name}</h3>
        <p className="text-sm text-gray-400">{metadata?.description}</p>
        <p className="text-sm text-gray-400">Quantity: {nft.quantity}</p>
        <p className="text-sm text-gray-400 break-all">
          Metadata:{" "}
          <Link
            href={`${process.env.NEXT_PUBLIC_PERMANENT_STORAGE_URL}/${nft.cid}`}
            target="_blank"
          >
            {nft.cid.slice(0, 6)}...{nft.cid.slice(-6)}
          </Link>
        </p>
        {imageCid && (
          <p className="text-sm text-gray-400 break-all">
            Image:{" "}
            <Link
              href={`${process.env.NEXT_PUBLIC_PERMANENT_STORAGE_URL}/${imageCid}`}
              target="_blank"
            >
              {imageCid.slice(0, 6)}...{imageCid.slice(-6)}
            </Link>
          </p>
        )}
        {metadata && metadata.external_url && (
          <p className="text-sm text-gray-400 break-all">
            External URL:{" "}
            <Link href={metadata.external_url} target="_blank">
              {metadata.external_url}
            </Link>
          </p>
        )}
        {address &&
          nft.creator &&
          address.toLowerCase() === nft.creator.toLowerCase() && (
            <button
              type="submit"
              className={`px-3 py-2 font-manrope font-extrabold bg-gradient-to-r from-[#1E58FC] via-[#D914E4] to-[#F10419] text-white rounded-sm hover:bg-green-700 transition ${"bg-blue-600 hover:bg-blue-700"}`}
            >
              Transfer
            </button>
          )}
      </div>
    </li>
  );
};
