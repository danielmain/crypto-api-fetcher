import * as TE from 'fp-ts/lib/TaskEither.js';
import { pipe } from 'fp-ts/lib/function.js';
import { AssetSymbol, parseAssetPrice } from './domain/price.js';

export type FreeCryptoConfig = {
  baseUrl: string;
  apiKey: string;
};

const assetQuoteUrl = (baseUrl: string, symbol: string): string =>
  `${baseUrl}/getData?symbol=${encodeURIComponent(symbol)}`;

const cryptoListUrl = (baseUrl: string): string => `${baseUrl}/getCryptoList`;

const fetchJson = (input: RequestInfo, init: RequestInit): TE.TaskEither<Error, unknown> =>
  TE.tryCatch(
    async () => {
      const response = await fetch(input, init);
      if (!response.ok) {
        const body = await response.text();
        throw new Error(`FreeCryptoAPI error ${response.status}: ${body}`);
      }
      return response.json() as Promise<unknown>;
    },
    (error) => (error instanceof Error ? error : new Error(String(error)))
  );

export const fetchAssetPrice = (
  config: FreeCryptoConfig,
  symbol: AssetSymbol
): TE.TaskEither<Error, number> =>
  pipe(
    fetchJson(assetQuoteUrl(config.baseUrl, symbol.requestSymbol), {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        Accept: 'application/json'
      }
    }),
    TE.chain((payload) => {
      if (process.env.DEBUG_FREECRYPTO_RESPONSE === 'true') {
        console.log('FreeCryptoAPI payload', JSON.stringify(payload));
      }
      return TE.fromEither(parseAssetPrice(payload, symbol.requestSymbol));
    })
  );

export const fetchCryptoList = (
  config: FreeCryptoConfig
): TE.TaskEither<Error, unknown> =>
  fetchJson(cryptoListUrl(config.baseUrl), {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      Accept: 'application/json'
    }
  });

export const toFreeCryptoConfig = (env: {
  freeCryptoApiKey: string;
  freeCryptoBaseUrl: string;
}): FreeCryptoConfig => ({
  apiKey: env.freeCryptoApiKey,
  baseUrl: env.freeCryptoBaseUrl
});
