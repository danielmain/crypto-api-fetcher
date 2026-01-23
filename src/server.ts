import http, { IncomingMessage, ServerResponse } from 'node:http';
import * as E from 'fp-ts/lib/Either.js';
import * as TE from 'fp-ts/lib/TaskEither.js';
import { pipe } from 'fp-ts/lib/function.js';
import { FreeCryptoConfig } from './freecrypto.js';
import { AssetSymbol, parseAssetSymbol } from './domain/price.js';
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
  config: FreeCryptoConfig,
  priceCache: PriceCache,
  symbol: AssetSymbol
): Promise<void> =>
  pipe(
    priceCache.getCachedAssetPrice(config, symbol),
    TE.match(
      (error) => {
        res.statusCode = 502;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: error.message }));
      },
      (price) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(
          JSON.stringify({ symbol: symbol.requestSymbol, price })
        );
      }
    )
  )();

const handleAssetsRoute = (
  res: ServerResponse,
  config: FreeCryptoConfig,
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
  config: FreeCryptoConfig,
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

  const rawSymbol = decodeURIComponent(path.slice(prefix.length));
  if (!rawSymbol || rawSymbol.includes('/')) {
    badRequest(res, 'Symbol is required as an uppercase asset code');
    return Promise.resolve();
  }

  const parsedSymbol = parseAssetSymbol(rawSymbol);
  if (E.isLeft(parsedSymbol)) {
    badRequest(res, parsedSymbol.left.message);
    return Promise.resolve();
  }

  return handlePriceRoute(res, config, priceCache, parsedSymbol.right);
};

export const createServer = (
  config: FreeCryptoConfig,
  priceCache: PriceCache,
  cryptoListCache: CryptoListCache
): http.Server =>
  http.createServer((req, res) => {
    void route(req, res, config, priceCache, cryptoListCache);
  });
