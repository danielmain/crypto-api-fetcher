import { QueryClient } from '@tanstack/query-core';
import * as TE from 'fp-ts/lib/TaskEither.js';
import { pipe } from 'fp-ts/lib/function.js';
import { AlpacaConfig, fetchBtcPrice } from './alpaca.js';

const CACHE_TTL_MS = 15 * 60 * 1000;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: CACHE_TTL_MS,
      gcTime: CACHE_TTL_MS,
      retry: false
    }
  }
});

export const getCachedBtcPrice = (
  config: AlpacaConfig
): TE.TaskEither<Error, number> =>
  TE.tryCatch(
    () =>
      queryClient.fetchQuery({
        queryKey: ['btc-price'],
        queryFn: () =>
          pipe(
            fetchBtcPrice(config),
            TE.match(
              (error) => {
                throw error;
              },
              (price) => price
            )
          )()
      }),
    (error) => (error instanceof Error ? error : new Error(String(error)))
  );
