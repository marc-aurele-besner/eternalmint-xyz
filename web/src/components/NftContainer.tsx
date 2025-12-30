"use client";

import { getGatewayUrl } from "@/config/app";
import {
  getImageOptimizationSettings,
  isLikelyAnimatedGif,
} from "@/utils/mediaUtils";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { NFT } from "../types";
import { TransferModal } from "./TransferModal";

interface NftContainerProps {
  nft: NFT;
  showTransferButton?: boolean;
  onQuantityUpdate?: (tokenId: string, newQuantity: number) => void;
}

export const NftContainer: React.FC<NftContainerProps> = ({
  nft,
  showTransferButton = false,
  onQuantityUpdate,
}) => {
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [modalNft, setModalNft] = useState(nft);

  const imageCid = useMemo(
    () => (nft.image ? nft.image.split("/").pop() : null),
    [nft.image]
  );

  // Check if the image is an animated GIF based on file extension or metadata
  const isAnimated = useMemo(() => {
    if (!nft.image) return false;
    return isLikelyAnimatedGif(nft.image);
  }, [nft.image]);

  // Get optimization settings for the image
  const imageSettings = useMemo(() => {
    return getImageOptimizationSettings(isAnimated ? "image/gif" : undefined);
  }, [isAnimated]);

  // Update modal NFT when the original NFT changes (but not during transfers)
  useEffect(() => {
    if (!isTransferModalOpen) {
      setModalNft(nft);
    }
  }, [nft, isTransferModalOpen]);

  // Handle quantity updates from the modal
  const handleQuantityUpdate = useCallback(
    (tokenId: string, newQuantity: number) => {
      setModalNft((prev) => ({
        ...prev,
        quantity: newQuantity,
      }));
      onQuantityUpdate?.(tokenId, newQuantity);
    },
    [onQuantityUpdate]
  );

  return (
    <>
      <li
        key={nft.id}
        className="flex flex-row items-start gap-6 p-4 rounded-xl shadow-lg border border-white/15 backdrop-filter backdrop-blur-md"
      >
        {nft.image ? (
          <div className="w-20 h-24 rounded-lg overflow-hidden bg-gray-800 flex items-center justify-center relative">
            <Image
              src={nft.image}
              alt={nft.name || "NFT"}
              className="max-w-full max-h-full object-contain rounded-lg"
              width={640}
              height={256}
              {...imageSettings}
            />
            {isAnimated && (
              <div className="absolute top-1 right-1 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded text-center">
                GIF
              </div>
            )}
          </div>
        ) : (
          <div className="w-20 h-24 rounded-lg bg-gray-800 flex items-center justify-center">
            <div className="text-4xl mb-2">🖼️</div>
            <div className="text-sm">No Image</div>
          </div>
        )}
        <div className="flex-1">
          <h3 className="text-xl font-semibold">{nft.name}</h3>
          <p className="text-sm text-gray-400">{nft.description}</p>
          <p className="text-sm text-gray-400">Quantity: {nft.quantity}</p>
          {nft.quantity === 0 && (
            <p className="text-sm text-red-400">(No tokens available)</p>
          )}
          <p className="text-sm text-gray-400 break-all">
            Metadata:{" "}
            <Link href={getGatewayUrl(nft.cid)} target="_blank">
              {nft.cid.slice(0, 6)}...{nft.cid.slice(-6)}
            </Link>
          </p>
          {imageCid && (
            <p className="text-sm text-gray-400 break-all">
              Image:{" "}
              <Link href={getGatewayUrl(imageCid)} target="_blank">
                {imageCid.slice(0, 6)}...{imageCid.slice(-6)}
              </Link>
            </p>
          )}

          {showTransferButton && (
            <div className="mt-4">
              <button
                onClick={() => setIsTransferModalOpen(true)}
                disabled={nft.quantity === 0}
                className={`px-4 py-2 text-white rounded-lg text-sm font-medium transition-opacity ${
                  nft.quantity === 0
                    ? "bg-gray-600 cursor-not-allowed opacity-50"
                    : "bg-gradient-to-r from-[#1E58FC] via-[#D914E4] to-[#F10419] hover:opacity-90"
                }`}
              >
                {nft.quantity === 0 ? "No Tokens Available" : "Transfer"}
              </button>
            </div>
          )}
        </div>
      </li>

      {showTransferButton && (
        <TransferModal
          isOpen={isTransferModalOpen}
          onClose={() => setIsTransferModalOpen(false)}
          nft={{
            id: modalNft.id,
            tokenId: modalNft.tokenId || "0",
            name: modalNft.name || `NFT ${modalNft.id}`,
            quantity: modalNft.quantity,
            cid: modalNft.cid,
            image: modalNft.image || "",
          }}
          onQuantityUpdate={handleQuantityUpdate}
        />
      )}
    </>
  );
};
