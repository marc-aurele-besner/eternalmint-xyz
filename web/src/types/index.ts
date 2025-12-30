export type NFT = {
  id: string;
  image: string;
  name: string;
  description: string;
  creator: string;
  quantity: number;
  cid: string;
  tokenId?: string;
};

export type NftMinted = {
  id: string;
  tokenId: number;
  creator: string;
  supply: number;
  cid: string;
  blockNumber: number;
  blockTimestamp: number;
};

export type Metadata = {
  image: string;
  name: string;
  description: string;
  external_url: string;
};
