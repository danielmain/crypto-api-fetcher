import { QueryClient } from '@tanstack/query-core';
import * as TE from 'fp-ts/lib/TaskEither.js';
import { pipe } from 'fp-ts/lib/function.js';
import { CoinGeckoConfig, fetchAssetPrice, fetchCryptoList } from './coingecko.js';
import { AssetId } from './domain/price.js';
import { CoinGeckoCryptoListResponse } from './domain/coingecko.js';

export type PriceCache = {
  getCachedAssetPrice: (
    config: CoinGeckoConfig,
    id: AssetId
  ) => TE.TaskEither<Error, number>;
};

export type CryptoListCache = {
  getCachedCryptoList: (
    config: CoinGeckoConfig
  ) => TE.TaskEither<Error, CoinGeckoCryptoListResponse>;
};

const createQueryClient = (ttlMs: number): QueryClient =>
  new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: ttlMs,
        gcTime: ttlMs,
        retry: false
      }
    }
  });

export const createPriceCache = (ttlMs: number): PriceCache => {
  const queryClient = createQueryClient(ttlMs);

  return {
    getCachedAssetPrice: (config, id) =>
      TE.tryCatch(
        () =>
          queryClient.fetchQuery({
            queryKey: ['asset-price', id.requestId],
            queryFn: () =>
              pipe(
                fetchAssetPrice(config, id),
                TE.match(
                  (error) => {
                    throw error;
                  },
                  (price) => price
                )
              )()
          }),
        (error) => (error instanceof Error ? error : new Error(String(error)))
      )
  };
};

export const createCryptoListCache = (ttlMs: number): CryptoListCache => {
  const queryClient = createQueryClient(ttlMs);

  return {
    getCachedCryptoList: (config) =>
      TE.tryCatch(
        () =>
          queryClient.fetchQuery({
            queryKey: ['crypto-list'],
            queryFn: () =>
              pipe(
                fetchCryptoList(config),
                TE.match(
                  (error) => {
                    throw error;
                  },
                  (payload) => payload
                )
              )()
          }),
        (error) => (error instanceof Error ? error : new Error(String(error)))
      )
  };
};
