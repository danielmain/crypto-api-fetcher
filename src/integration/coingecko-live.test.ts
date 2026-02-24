import 'dotenv/config';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import * as E from 'fp-ts/lib/Either.js';
import { loadEnv } from '../env.js';
import { fetchAssetPrice, toCoinGeckoConfig } from '../coingecko.js';
import { parseAssetId } from '../domain/price.js';
import { createServer } from '../server.js';
import { createCryptoListCache, createPriceCache } from '../price-cache.js';

const ASSETS = [
  { id: 'ethereum', minPrice: 0.01 },
  { id: 'cardano', minPrice: 0.0001 },
  { id: 'bitcoin', minPrice: 0.01 }
];

const requireEnv = () => {
  const env = loadEnv();
  if (E.isLeft(env)) {
    throw new Error(env.left.message);
  }
  return env.right;
};

describe('live CoinGecko integration', () => {
  for (const asset of ASSETS) {
    it(
      `fetches ${asset.id} price directly from CoinGecko and enforces minimum threshold`,
      async () => {
        const env = requireEnv();
        const parsedId = parseAssetId(asset.id);
        if (E.isLeft(parsedId)) {
          throw new Error(parsedId.left.message);
        }
        const priceResult = await fetchAssetPrice(
          toCoinGeckoConfig(env),
          parsedId.right
        )();
        if (E.isLeft(priceResult)) {
          throw new Error(`CoinGecko fetch failed: ${priceResult.left.message}`);
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
      server = createServer(toCoinGeckoConfig(env), priceCache, cryptoListCache);

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
        `serves ${asset.id} price from /api/price/:id and enforces minimum threshold`,
        async () => {
          const response = await fetch(`${baseUrl}/api/price/${asset.id}`);
          if (!response.ok) {
            const body = await response.text();
            throw new Error(`HTTP ${response.status}: ${body}`);
          }
          const payload = (await response.json()) as {
            id?: string;
            price?: number;
            error?: string;
          };
          if (payload.error) {
            throw new Error(`API error: ${payload.error}`);
          }
          expect(payload.id).toBe(asset.id);
          expect(payload.price).toBeDefined();
          expect(payload.price as number).toBeGreaterThanOrEqual(asset.minPrice);
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
        const payload = (await response.json()) as unknown[];
        expect(Array.isArray(payload)).toBe(true);
        expect(payload.length).toBeGreaterThan(0);
      },
      20000
    );
  });
});
