export type CoinGeckoPlatforms = Record<string, string>;

export type CoinGeckoCryptoAsset = {
  id: string;
  symbol: string;
  name: string;
  platforms?: CoinGeckoPlatforms;
};

export type CoinGeckoPriceResponse = Record<string, { usd: number }>;

export type CoinGeckoCryptoListResponse = CoinGeckoCryptoAsset[];