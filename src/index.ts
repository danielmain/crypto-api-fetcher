import 'dotenv/config';
import { loadEnv } from './env.js';
import { createServer } from './server.js';
import { toFreeCryptoConfig } from './freecrypto.js';
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
    toFreeCryptoConfig(env),
    priceCache,
    cryptoListCache
  );

  server.listen(env.port, () => {
    console.log(`Listening on http://localhost:${env.port}`);
  });
};

start();
