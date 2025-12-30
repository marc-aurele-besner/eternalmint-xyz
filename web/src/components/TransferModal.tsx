"use client";

import { APP_CONFIG } from "@/config/app";
import { currentChain } from "@/config/chains";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import {
  useAccount,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  nft: {
    id: string;
    tokenId: string;
    name: string;
    quantity: number;
    cid: string;
    image?: string;
  };
  onQuantityUpdate?: (tokenId: string, newQuantity: number) => void;
}

const CONTRACT_ABI = [
  {
    inputs: [
      { name: "from", type: "address" },
      { name: "to", type: "address" },
      { name: "id", type: "uint256" },
      { name: "amount", type: "uint256" },
      { name: "data", type: "bytes" },
    ],
    name: "safeTransferFrom",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

export const TransferModal: React.FC<TransferModalProps> = ({
  isOpen,
  onClose,
  nft,
  onQuantityUpdate,
}) => {
  const { address } = useAccount();
  const [recipient, setRecipient] = useState("");
  const [amountInput, setAmountInput] = useState("1");
  const [isValidAddress, setIsValidAddress] = useState(false);
  const [currentQuantity, setCurrentQuantity] = useState(nft.quantity);
  const transferredAmountRef = useRef(0);
  const initialQuantityRef = useRef(nft.quantity);
  const hasProcessedSuccessRef = useRef(false);
  const lastTransferredAmountRef = useRef(0);

  const { data: hash, writeContract, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  // Get the numeric amount for validation and transfer
  const amount = parseInt(amountInput) || 0;

  // Update current quantity when nft prop changes
  useEffect(() => {
    setCurrentQuantity(nft.quantity);
    transferredAmountRef.current = 0;
    initialQuantityRef.current = nft.quantity;
    hasProcessedSuccessRef.current = false;
    lastTransferredAmountRef.current = 0;
  }, [nft.quantity]);

  // Handle successful transfer
  useEffect(() => {
    if (isSuccess && !hasProcessedSuccessRef.current) {
      hasProcessedSuccessRef.current = true;
      // Use the amount that was actually transferred (stored in ref)
      const transferredAmount = lastTransferredAmountRef.current;
      // Add to total transferred amount
      transferredAmountRef.current += transferredAmount;
      // Update current quantity based on initial quantity
      const newQuantity =
        initialQuantityRef.current - transferredAmountRef.current;
      setCurrentQuantity(newQuantity);
      // Update parent component immediately
      if (onQuantityUpdate) {
        onQuantityUpdate(nft.tokenId, newQuantity);
      }
      // Reset form fields but keep modal open
      setRecipient("");
      setAmountInput("1");
      setIsValidAddress(false);
    }
  }, [isSuccess, onQuantityUpdate, nft.tokenId]);

  // Reset form fields
  const resetForm = () => {
    setRecipient("");
    setAmountInput("1");
    setIsValidAddress(false);
  };

  // Validate Ethereum address
  const validateAddress = (address: string) => {
    const ethAddressRegex = /^0x[a-fA-F0-9]{40}$/;
    return ethAddressRegex.test(address);
  };

  const handleRecipientChange = (value: string) => {
    setRecipient(value);
    setIsValidAddress(validateAddress(value));
  };

  const handleAmountBlur = () => {
    // Validate on blur
    if (isNaN(amount) || amount < 1) {
      setAmountInput("1");
    } else if (amount > currentQuantity) {
      setAmountInput(currentQuantity.toString());
    }
  };

  const handleTransfer = async () => {
    if (!address || !isValidAddress) {
      return;
    }

    // Store the amount that will be transferred
    lastTransferredAmountRef.current = amount;

    try {
      writeContract({
        address: APP_CONFIG.contract.address as `0x${string}`,
        abi: CONTRACT_ABI,
        functionName: "safeTransferFrom",
        args: [
          address,
          recipient as `0x${string}`,
          BigInt(nft.tokenId),
          BigInt(amount),
          "0x", // empty data
        ],
        chain: currentChain,
      });
    } catch (error) {
      console.error("Transfer error:", error);
    }
  };

  const handleClose = () => {
    if (!isPending && !isConfirming) {
      // Update parent component with final quantity if there were transfers
      if (transferredAmountRef.current > 0 && onQuantityUpdate) {
        onQuantityUpdate(nft.tokenId, currentQuantity);
      }
      resetForm();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-white/15 rounded-xl p-6 w-[400px] max-w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">Transfer NFT</h2>
          <button
            onClick={handleClose}
            disabled={isPending || isConfirming}
            className="text-gray-400 hover:text-white disabled:opacity-50"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          {currentQuantity === 0 && (
            <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-3">
              <p className="text-yellow-300 text-sm">
                This NFT has no available tokens for transfer. You can still
                view the details below.
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              NFT
            </label>
            <div className="bg-gray-800 p-3 rounded-lg">
              <div className="flex items-center gap-3">
                <Image
                  src={nft.image || ""}
                  alt={nft.name}
                  width={80}
                  height={100}
                  className="w-16 h-20 rounded-lg object-cover flex-shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-white font-medium">{nft.name}</p>
                  <p className="text-gray-400 text-sm break-all">
                    Token ID: {nft.tokenId}
                  </p>
                  <p
                    className={`text-sm ${
                      currentQuantity === 0 ? "text-red-400" : "text-gray-400"
                    }`}
                  >
                    Available: {currentQuantity}
                    {currentQuantity === 0 && " (No tokens available)"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Recipient Address
            </label>
            <input
              type="text"
              value={recipient}
              onChange={(e) => handleRecipientChange(e.target.value)}
              placeholder="0x..."
              className={`w-full p-3 rounded-lg bg-gray-800 border font-mono text-sm ${
                recipient && !isValidAddress
                  ? "border-red-500"
                  : isValidAddress
                  ? "border-green-500"
                  : "border-gray-600"
              } text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500`}
              disabled={isPending || isConfirming || currentQuantity === 0}
            />
            {recipient && !isValidAddress && (
              <p className="text-red-400 text-sm mt-1">
                Invalid Ethereum address
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Amount
            </label>
            <input
              type="number"
              min="1"
              max={currentQuantity}
              value={amountInput}
              onChange={(e) => setAmountInput(e.target.value)}
              onBlur={handleAmountBlur}
              className="w-full p-3 rounded-lg bg-gray-800 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isPending || isConfirming || currentQuantity === 0}
            />
            <p className="text-gray-400 text-sm mt-1">
              Max: {currentQuantity}
              {currentQuantity === 0 && (
                <span className="text-red-400 ml-2">(No tokens available)</span>
              )}
            </p>
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3">
              <p className="text-red-300 text-sm break-words">
                {error.message}
              </p>
            </div>
          )}

          {isSuccess && (
            <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-3">
              <p className="text-green-300 text-sm">
                Transfer successful!{" "}
                <a
                  href={`${currentChain.blockExplorers?.default.url}/tx/${hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 underline"
                >
                  View transaction
                </a>
              </p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              onClick={handleClose}
              disabled={isPending || isConfirming}
              className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
            >
              {isSuccess ? "Close" : "Cancel"}
            </button>
            <button
              onClick={handleTransfer}
              disabled={
                !isValidAddress ||
                isPending ||
                isConfirming ||
                amount < 1 ||
                currentQuantity === 0
              }
              className="flex-1 px-4 py-2 bg-gradient-to-r from-[#1E58FC] via-[#D914E4] to-[#F10419] hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-opacity"
            >
              {currentQuantity === 0
                ? "No Tokens Available"
                : isPending || isConfirming
                ? "Transferring..."
                : "Transfer"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
