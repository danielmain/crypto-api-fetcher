import http, { IncomingMessage, ServerResponse } from 'node:http';
import * as TE from 'fp-ts/TaskEither';
import { pipe } from 'fp-ts/function';
import { AlpacaConfig } from './alpaca.js';
import { getCachedBtcPrice } from './price-cache.js';

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

const handleTestRoute = (
  res: ServerResponse,
  config: AlpacaConfig
): Promise<void> =>
  pipe(
    getCachedBtcPrice(config),
    TE.match(
      (error) => {
        res.statusCode = 502;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: error.message }));
      },
      (price) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ symbol: 'BTC/USD', price }));
      }
    )
  )();

const route = (
  req: IncomingMessage,
  res: ServerResponse,
  config: AlpacaConfig
): Promise<void> => {
  if (req.url !== '/api/test') {
    notFound(res);
    return Promise.resolve();
  }

  if (req.method !== 'GET') {
    methodNotAllowed(res);
    return Promise.resolve();
  }

  return handleTestRoute(res, config);
};

export const createServer = (
  config: AlpacaConfig
): http.Server =>
  http.createServer((req, res) => {
    void route(req, res, config);
  });
