import { QueryClient } from '@tanstack/query-core';
import * as TE from 'fp-ts/lib/TaskEither.js';
import { pipe } from 'fp-ts/lib/function.js';
import { FreeCryptoConfig, fetchAssetPrice, fetchCryptoList } from './freecrypto.js';
import { AssetSymbol } from './domain/price.js';

export type PriceCache = {
  getCachedAssetPrice: (
    config: FreeCryptoConfig,
    symbol: AssetSymbol
  ) => TE.TaskEither<Error, number>;
};

export type CryptoListCache = {
  getCachedCryptoList: (
    config: FreeCryptoConfig
  ) => TE.TaskEither<Error, unknown>;
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
    getCachedAssetPrice: (config, symbol) =>
      TE.tryCatch(
        () =>
          queryClient.fetchQuery({
            queryKey: ['asset-price', symbol.requestSymbol],
            queryFn: () =>
              pipe(
                fetchAssetPrice(config, symbol),
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
