import 'dotenv/config';
import { loadEnv } from './env.js';
import { createServer } from './server.js';
import { toCoinGeckoConfig } from './coingecko.js';
import * as E from 'fp-ts/lib/Either.js';
import { createCryptoListCache, createPriceCache } from './price-cache.js';

const start = () => {
  const envResult = loadEnv();

  if (E.isLeft(envResult)) {
    console.error(envResult.left.message);
    process.exit(1);
  }

  const env = envResult.right;
  const priceCache = createPriceCache(env.priceCacheTtlMinutes * 60 * 1000);
  const cryptoListCache = createCryptoListCache(
    env.cryptoListCacheTtlMinutes * 60 * 1000
  );
  const server = createServer(
    toCoinGeckoConfig(env),
    priceCache,
    cryptoListCache
  );

  server.listen(env.port, '0.0.0.0', () => {
    console.log(`Listening on http://0.0.0.0:${env.port}`);
  });
};

start();
