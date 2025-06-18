import { NetworkId } from '@autonomys/auto-utils';

// Converts auto-utils NetworkId to a valid network string for createAutoDriveApi
export function networkIdToString(networkId: NetworkId): "taurus" | "mainnet" {
  switch (networkId) {
    case NetworkId.TAURUS:
      return "taurus";
    case NetworkId.MAINNET:
      return "mainnet";
    default:
      throw new Error(`Unsupported NetworkId: ${networkId}`);
  }
}
