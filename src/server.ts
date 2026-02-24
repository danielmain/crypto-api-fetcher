import http, { IncomingMessage, ServerResponse } from 'node:http';
import * as E from 'fp-ts/lib/Either.js';
import * as TE from 'fp-ts/lib/TaskEither.js';
import { pipe } from 'fp-ts/lib/function.js';
import { CoinGeckoConfig } from './coingecko.js';
import { AssetId, parseAssetId } from './domain/price.js';
import { CryptoListCache, PriceCache } from './price-cache.js';

const notFound = (res: ServerResponse): void => {
  res.statusCode = 404;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({ error: 'Not found' }));
};

const methodNotAllowed = (res: ServerResponse): void => {
  res.statusCode = 405;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({ error: 'Method not allowed' }));
};

const badRequest = (res: ServerResponse, message: string): void => {
  res.statusCode = 400;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({ error: message }));
};

const handlePriceRoute = (
  res: ServerResponse,
  config: CoinGeckoConfig,
  priceCache: PriceCache,
  id: AssetId
): Promise<void> =>
  pipe(
    priceCache.getCachedAssetPrice(config, id),
    TE.match(
      (error) => {
        res.statusCode = 502;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: error.message }));
      },
      (price) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ id: id.requestId, price }));
      }
    )
  )();

const handleAssetsRoute = (
  res: ServerResponse,
  config: CoinGeckoConfig,
  cryptoListCache: CryptoListCache
): Promise<void> =>
  pipe(
    cryptoListCache.getCachedCryptoList(config),
    TE.match(
      (error) => {
        res.statusCode = 502;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: error.message }));
      },
      (payload) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(payload));
      }
    )
  )();

const route = (
  req: IncomingMessage,
  res: ServerResponse,
  config: CoinGeckoConfig,
  priceCache: PriceCache,
  cryptoListCache: CryptoListCache
): Promise<void> => {
  const path = (req.url ?? '').split('?')[0];
  if (path === '/api/assets') {
    if (req.method !== 'GET') {
      methodNotAllowed(res);
      return Promise.resolve();
    }
    return handleAssetsRoute(res, config, cryptoListCache);
  }

  const prefix = '/api/price/';
  if (!path.startsWith(prefix)) {
    notFound(res);
    return Promise.resolve();
  }

  if (req.method !== 'GET') {
    methodNotAllowed(res);
    return Promise.resolve();
  }

  const rawId = decodeURIComponent(path.slice(prefix.length));
  if (!rawId || rawId.includes('/')) {
    badRequest(res, 'Asset id is required (e.g., bitcoin)');
    return Promise.resolve();
  }

  const parsedId = parseAssetId(rawId);
  if (E.isLeft(parsedId)) {
    badRequest(res, parsedId.left.message);
    return Promise.resolve();
  }

  return handlePriceRoute(res, config, priceCache, parsedId.right);
};

export const createServer = (
  config: CoinGeckoConfig,
  priceCache: PriceCache,
  cryptoListCache: CryptoListCache
): http.Server =>
  http.createServer((req, res) => {
    void route(req, res, config, priceCache, cryptoListCache);
  });
