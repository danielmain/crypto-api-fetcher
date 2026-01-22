import * as TE from 'fp-ts/lib/TaskEither.js';
import { pipe } from 'fp-ts/lib/function.js';
import { parseBtcPrice } from './domain/price.js';

export type AlpacaConfig = {
  baseUrl: string;
  apiKey: string;
  apiSecret: string;
};

const btcQuoteUrl = (baseUrl: string): string =>
  `${baseUrl}/v1beta3/crypto/us/latest/quotes?symbols=BTC/USD`;

const fetchJson = (input: RequestInfo, init: RequestInit): TE.TaskEither<Error, unknown> =>
  TE.tryCatch(
    async () => {
      const response = await fetch(input, init);
      if (!response.ok) {
        const body = await response.text();
        throw new Error(`Alpaca error ${response.status}: ${body}`);
      }
      return response.json() as Promise<unknown>;
    },
    (error) => (error instanceof Error ? error : new Error(String(error)))
  );

export const fetchBtcPrice = (
  config: AlpacaConfig
): TE.TaskEither<Error, number> =>
  pipe(
    fetchJson(btcQuoteUrl(config.baseUrl), {
      method: 'GET',
      headers: {
        'APCA-API-KEY-ID': config.apiKey,
        'APCA-API-SECRET-KEY': config.apiSecret,
        Accept: 'application/json'
      }
    }),
    TE.chain((payload) => TE.fromEither(parseBtcPrice(payload)))
  );

export const toAlpacaConfig = (env: {
  alpacaApiKey: string;
  alpacaApiSecret: string;
  alpacaBaseUrl: string;
}): AlpacaConfig => ({
  apiKey: env.alpacaApiKey,
  apiSecret: env.alpacaApiSecret,
  baseUrl: env.alpacaBaseUrl
});
