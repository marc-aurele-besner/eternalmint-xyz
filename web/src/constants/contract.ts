// Contract ABIs used by both the server-side mint route (ethers v6) and the
// client-side transfer modal (viem). Keep these in one place so the two callers
// can never drift apart when the contract surface changes.

// `as const` so viem can infer tuple types for `writeContract`. ethers v6
// accepts readonly arrays in its `ContractAbi` parameter, so the same export
// works on both sides without spreading.

export const MINT_ABI = [
  {
    type: "function",
    name: "mint",
    inputs: [
      { name: "creator", type: "address", internalType: "address" },
      { name: "cid", type: "string", internalType: "string" },
      { name: "supply", type: "uint256", internalType: "uint256" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
] as const;

export const SAFE_TRANSFER_FROM_ABI = [
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

// Full ABI: every function the app calls. Useful when a consumer needs more
// than one function in a single client (e.g. read helpers built on top of viem).
export const CONTRACT_ABI = [...MINT_ABI, ...SAFE_TRANSFER_FROM_ABI] as const;
