import { Chain } from "wagmi/chains";
import { APP_CONFIG } from "./app";

// Autonomys Auto EVM Configuration (dynamically configured based on environment)
export const autonomysAutoEVM: Chain = {
  id: APP_CONFIG.evmNetwork.chainId,
  name: APP_CONFIG.evmNetwork.name,
  nativeCurrency: {
    decimals: APP_CONFIG.evmNetwork.currency.decimals,
    name: APP_CONFIG.evmNetwork.currency.name,
    symbol: APP_CONFIG.evmNetwork.currency.symbol,
  },
  rpcUrls: {
    default: {
      http: [APP_CONFIG.evmNetwork.rpcUrl],
    },
    public: {
      http: [APP_CONFIG.evmNetwork.rpcUrl],
    },
  },
  blockExplorers: {
    default: {
      name: `${APP_CONFIG.evmNetwork.name} Explorer`,
      url: APP_CONFIG.evmNetwork.blockExplorer,
    },
  },
  testnet: APP_CONFIG.evmNetwork.testnet,
};

// TODO: Autonomys Mainnet Auto EVM Configuration (Coming Soon)
// export const autonomysMainnetAutoEVM: Chain = {
//   id: TBD,
//   name: "Autonomys Mainnet Auto EVM",
//   nativeCurrency: {
//     decimals: 18,
//     name: "AI3",
//     symbol: "AI3",
//   },
//   rpcUrls: {
//     default: {
//       http: ["https://auto-evm.autonomys.xyz"],
//     },
//     public: {
//       http: ["https://auto-evm.autonomys.xyz"],
//     },
//   },
//   blockExplorers: {
//     default: {
//       name: "Autonomys Explorer",
//       url: "https://explorer.autonomys.xyz",
//     },
//   },
//   testnet: false,
// };

// Export current chain for use throughout the app
export const currentChain = autonomysAutoEVM;
