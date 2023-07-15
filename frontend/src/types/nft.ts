export type NftAttribute = {
  trait_type: string;
  value: string;
}

export type NftItem = {
  tokenURI: string;
  tokenId: string;
}

export type NftMeta = {
  owner?: string;
  tokenId?: bigint,
  name: string;
  description: string;
  image: string;
  attributes: NftAttribute[];
}

export type Nft = {
  meta: NftMeta
} 

export type FileReq = {
  bytes: Uint8Array;
  contentType: string;
  fileName: string;
}

export type PinataRes = {
  IpfsHash: string;
  PinSize: number;
  Timestamp: string;
  isDuplicate: boolean;
}
export type UnitTime = 'days'|'hours'|'minutes'

export type AuctionParams = {
  tokenId: bigint,
  startPrice: string,
  duration: string,
  unitTime: UnitTime
}

export type Auction = {
  seller: string;
  tokenId: bigint;
  price: bigint;
  netPrice: bigint;
  startAt: bigint;
  endAt: bigint;
  status: bigint;
};
