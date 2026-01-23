import 'dotenv/config';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import * as E from 'fp-ts/lib/Either.js';
import { loadEnv } from '../env.js';
import { fetchAssetPrice, toFreeCryptoConfig } from '../freecrypto.js';
import { parseAssetSymbol } from '../domain/price.js';
import { createServer } from '../server.js';
import { createCryptoListCache, createPriceCache } from '../price-cache.js';

const ASSETS = [
  { symbol: 'ETH', minPrice: 0.01 },
  { symbol: 'ADA', minPrice: 0.0001 },
  { symbol: 'BTC', minPrice: 0.01 }
];

const requireEnv = () => {
  const env = loadEnv();
  if (E.isLeft(env)) {
    throw new Error(env.left.message);
  }
  return env.right;
};

describe('live FreeCryptoAPI integration', () => {
  for (const asset of ASSETS) {
    it(
      `fetches ${asset.symbol} price directly from FreeCryptoAPI and enforces minimum threshold`,
      async () => {
        const env = requireEnv();
        const parsedSymbol = parseAssetSymbol(asset.symbol);
        if (E.isLeft(parsedSymbol)) {
          throw new Error(parsedSymbol.left.message);
        }
        const priceResult = await fetchAssetPrice(
          toFreeCryptoConfig(env),
          parsedSymbol.right
        )();
        if (E.isLeft(priceResult)) {
          throw new Error(
            `FreeCryptoAPI fetch failed: ${priceResult.left.message}`
          );
        }
        expect(priceResult.right).toBeGreaterThanOrEqual(asset.minPrice);
      },
      20000
    );
  }

  describe('http endpoint', () => {
    let server: ReturnType<typeof createServer> | null = null;
    let baseUrl = '';

    beforeAll(async () => {
      const env = requireEnv();
      const priceCache = createPriceCache(env.priceCacheTtlMinutes * 60 * 1000);
      const cryptoListCache = createCryptoListCache(
        env.cryptoListCacheTtlMinutes * 60 * 1000
      );
      server = createServer(
        toFreeCryptoConfig(env),
        priceCache,
        cryptoListCache
      );

      await new Promise<void>((resolve) => {
        server?.listen(0, '127.0.0.1', () => {
          const address = server?.address();
          if (typeof address === 'object' && address) {
            baseUrl = `http://127.0.0.1:${address.port}`;
          }
          resolve();
        });
      });
    });

    afterAll(async () => {
      if (!server) return;
      await new Promise<void>((resolve, reject) => {
        server?.close((err) => (err ? reject(err) : resolve()));
      });
      server = null;
    });

    for (const asset of ASSETS) {
      it(
        `serves ${asset.symbol} price from /api/price/:symbol and enforces minimum threshold`,
        async () => {
          const response = await fetch(
            `${baseUrl}/api/price/${asset.symbol}`
          );
          if (!response.ok) {
            const body = await response.text();
            throw new Error(`HTTP ${response.status}: ${body}`);
          }
          const payload = (await response.json()) as {
            price?: number;
            error?: string;
          };
          if (payload.error) {
            throw new Error(`API error: ${payload.error}`);
          }
          expect(payload.price).toBeDefined();
          expect(payload.price as number).toBeGreaterThanOrEqual(
            asset.minPrice
          );
        },
        20000
      );
    }

    it(
      'serves the crypto list from /api/assets',
      async () => {
        const response = await fetch(`${baseUrl}/api/assets`);
        if (!response.ok) {
          const body = await response.text();
          throw new Error(`HTTP ${response.status}: ${body}`);
        }
        const payload = (await response.json()) as Record<string, unknown>;
        expect(Object.keys(payload).length).toBeGreaterThan(0);
      },
      20000
    );
  });
});
