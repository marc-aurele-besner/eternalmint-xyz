"use client";

import { APP_CONFIG } from "@/config/app";
import { currentChain } from "@/config/chains";
import { SAFE_TRANSFER_FROM_ABI } from "@/constants/contract";
import { NFT } from "@/types";
import { useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import { useEffect, useReducer } from "react";
import { isAddress } from "viem";
import {
  useAccount,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  nft: NFT;
  onQuantityUpdate?: (tokenId: string, newQuantity: number) => void;
}

// Modal state machine. `status` drives the lifecycle:
//   idle       — form is ready, no transfer in flight
//   submitting — writeContract was called, awaiting receipt
//   success    — receipt confirmed, form has been reset
//
// `pendingAmount` captures the amount of the in-flight transfer so the
// success effect doesn't have to re-derive it from a closure or ref.
type Status = "idle" | "submitting" | "success";

type State = {
  recipient: string;
  amount: string;
  quantity: number;
  status: Status;
  pendingAmount: number;
  lastHash?: `0x${string}`;
};

type Action =
  | { type: "set_recipient"; value: string }
  | { type: "set_amount"; value: string }
  | { type: "submit"; amount: number }
  | { type: "success"; hash: `0x${string}`; amount: number }
  | { type: "error" }
  | { type: "resync"; quantity: number }
  | { type: "reset" };

const fresh = (quantity: number): State => ({
  recipient: "",
  amount: "1",
  quantity,
  status: "idle",
  pendingAmount: 0,
});

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "set_recipient":
      return { ...state, recipient: action.value };
    case "set_amount":
      return { ...state, amount: action.value };
    case "submit":
      return { ...state, status: "submitting", pendingAmount: action.amount };
    case "success":
      // Guard against double-processing: only commit if we were actually
      // submitting. A stale `isSuccess` from a previous transfer cannot
      // decrement the quantity a second time.
      if (state.status !== "submitting") return state;
      return {
        ...state,
        quantity: Math.max(0, state.quantity - action.amount),
        status: "success",
        lastHash: action.hash,
        pendingAmount: 0,
        recipient: "",
        amount: "1",
      };
    case "error":
      // Rejected signature or contract revert: drop back to idle so the
      // user can retry without the form being stuck.
      if (state.status !== "submitting") return state;
      return { ...state, status: "idle", pendingAmount: 0 };
    case "resync":
      // Don't clobber an in-flight or just-completed transfer. The parent
      // echo of our own onQuantityUpdate will arrive here, and we want the
      // success banner / reset form to stay visible.
      if (state.status !== "idle") return state;
      return fresh(action.quantity);
    case "reset":
      return fresh(state.quantity);
  }
}

export const TransferModal: React.FC<TransferModalProps> = ({
  isOpen,
  onClose,
  nft,
  onQuantityUpdate,
}) => {
  const { address } = useAccount();
  const queryClient = useQueryClient();
  const [state, dispatch] = useReducer(reducer, nft.quantity, fresh);

  const { data: hash, writeContract, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const amount = parseInt(state.amount) || 0;
  const isValidAddress = isAddress(state.recipient);
  const isBusy = isPending || isConfirming;

  // Pick up quantity changes from the parent (e.g., a background re-fetch).
  useEffect(() => {
    dispatch({ type: "resync", quantity: nft.quantity });
  }, [nft.quantity]);

  // Commit a confirmed transfer: decrement quantity, notify the parent,
  // and invalidate any React Query caches keyed on the NFT list. The
  // reducer's status guard makes this effect safe to re-run.
  useEffect(() => {
    if (!isSuccess || !hash || state.status !== "submitting") return;
    const transferredAmount = state.pendingAmount;
    dispatch({ type: "success", hash, amount: transferredAmount });
    if (onQuantityUpdate && nft.tokenId) {
      onQuantityUpdate(
        nft.tokenId,
        Math.max(0, state.quantity - transferredAmount),
      );
    }
    // Forward-compatible: if/when the parent switches to useQuery, this
    // refetches the NFT list. Harmless if no query is registered.
    queryClient.invalidateQueries({ queryKey: ["nftMinteds"] });
  }, [
    isSuccess,
    hash,
    state.status,
    state.pendingAmount,
    state.quantity,
    onQuantityUpdate,
    nft.tokenId,
    queryClient,
  ]);

  // Reset to idle if writeContract produced an error (e.g., user rejected
  // the signature) so the form becomes interactive again.
  useEffect(() => {
    if (state.status === "submitting" && error && !isSuccess) {
      dispatch({ type: "error" });
    }
  }, [error, isSuccess, state.status]);

  const handleAmountBlur = () => {
    if (isNaN(amount) || amount < 1) {
      dispatch({ type: "set_amount", value: "1" });
    } else if (amount > state.quantity) {
      dispatch({ type: "set_amount", value: state.quantity.toString() });
    }
  };

  const handleTransfer = () => {
    if (!address || !isValidAddress || !nft.tokenId) return;
    try {
      writeContract({
        address: APP_CONFIG.contract.address as `0x${string}`,
        abi: SAFE_TRANSFER_FROM_ABI,
        functionName: "safeTransferFrom",
        args: [
          address,
          state.recipient as `0x${string}`,
          BigInt(nft.tokenId),
          BigInt(amount),
          "0x",
        ],
        chain: currentChain,
      });
      dispatch({ type: "submit", amount });
    } catch (err) {
      console.error("Transfer error:", err);
    }
  };

  const handleClose = () => {
    if (isBusy) return;
    // Make sure the parent has the final quantity if the user made
    // transfers and the success callback already fired.
    if (
      onQuantityUpdate &&
      nft.tokenId &&
      state.quantity !== nft.quantity
    ) {
      onQuantityUpdate(nft.tokenId, state.quantity);
    }
    dispatch({ type: "reset" });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-white/15 rounded-xl p-6 w-[400px] max-w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">Transfer NFT</h2>
          <button
            onClick={handleClose}
            disabled={isBusy}
            className="text-gray-400 hover:text-white disabled:opacity-50"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          {state.quantity === 0 && (
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
                      state.quantity === 0 ? "text-red-400" : "text-gray-400"
                    }`}
                  >
                    Available: {state.quantity}
                    {state.quantity === 0 && " (No tokens available)"}
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
              value={state.recipient}
              onChange={(e) =>
                dispatch({ type: "set_recipient", value: e.target.value })
              }
              placeholder="0x..."
              className={`w-full p-3 rounded-lg bg-gray-800 border font-mono text-sm ${
                state.recipient && !isValidAddress
                  ? "border-red-500"
                  : isValidAddress
                  ? "border-green-500"
                  : "border-gray-600"
              } text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500`}
              disabled={isBusy || state.quantity === 0}
            />
            {state.recipient && !isValidAddress && (
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
              max={state.quantity}
              value={state.amount}
              onChange={(e) =>
                dispatch({ type: "set_amount", value: e.target.value })
              }
              onBlur={handleAmountBlur}
              className="w-full p-3 rounded-lg bg-gray-800 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isBusy || state.quantity === 0}
            />
            <p className="text-gray-400 text-sm mt-1">
              Max: {state.quantity}
              {state.quantity === 0 && (
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

          {state.status === "success" && state.lastHash && (
            <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-3">
              <p className="text-green-300 text-sm">
                Transfer successful!{" "}
                <a
                  href={`${currentChain.blockExplorers?.default.url}/tx/${state.lastHash}`}
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
              disabled={isBusy}
              className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
            >
              {state.status === "success" ? "Close" : "Cancel"}
            </button>
            <button
              onClick={handleTransfer}
              disabled={
                !isValidAddress ||
                isBusy ||
                amount < 1 ||
                state.quantity === 0
              }
              className="flex-1 px-4 py-2 bg-gradient-to-r from-[#1E58FC] via-[#D914E4] to-[#F10419] hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-opacity"
            >
              {state.quantity === 0
                ? "No Tokens Available"
                : isBusy
                ? "Transferring..."
                : "Transfer"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
