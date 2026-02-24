import * as TE from 'fp-ts/lib/TaskEither.js';
import { pipe } from 'fp-ts/lib/function.js';
import { AssetId, parseAssetPrice } from './domain/price.js';

export type CoinGeckoConfig = {
  baseUrl: string;
  apiKey: string;
};

const withApiKey = (url: URL, apiKey: string): URL => {
  url.searchParams.set('x_cg_demo_api_key', apiKey);
  return url;
};

const assetQuoteUrl = (baseUrl: string, id: string, apiKey: string): string => {
  const url = new URL('simple/price', baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`);
  url.searchParams.set('vs_currencies', 'usd');
  url.searchParams.set('ids', id);
  return withApiKey(url, apiKey).toString();
};

const cryptoListUrl = (baseUrl: string, apiKey: string): string => {
  const url = new URL('coins/list', baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`);
  url.searchParams.set('include_platform', 'false');
  return withApiKey(url, apiKey).toString();
};

const fetchJson = (
  input: RequestInfo,
  init: RequestInit
): TE.TaskEither<Error, unknown> =>
  TE.tryCatch(
    async () => {
      const response = await fetch(input, init);
      if (!response.ok) {
        const body = await response.text();
        throw new Error(`CoinGecko error ${response.status}: ${body}`);
      }
      return response.json() as Promise<unknown>;
    },
    (error) => (error instanceof Error ? error : new Error(String(error)))
  );

export const fetchAssetPrice = (
  config: CoinGeckoConfig,
  id: AssetId
): TE.TaskEither<Error, number> =>
  pipe(
    fetchJson(assetQuoteUrl(config.baseUrl, id.requestId, config.apiKey), {
      method: 'GET',
      headers: {
        Accept: 'application/json'
      }
    }),
    TE.chain((payload) => TE.fromEither(parseAssetPrice(payload, id.requestId)))
  );

export const fetchCryptoList = (
  config: CoinGeckoConfig
): TE.TaskEither<Error, unknown> =>
  fetchJson(cryptoListUrl(config.baseUrl, config.apiKey), {
    method: 'GET',
    headers: {
      Accept: 'application/json'
    }
  });

export const toCoinGeckoConfig = (env: {
  coingeckoApiKey: string;
  coingeckoBaseUrl: string;
}): CoinGeckoConfig => ({
  apiKey: env.coingeckoApiKey,
  baseUrl: env.coingeckoBaseUrl
});
