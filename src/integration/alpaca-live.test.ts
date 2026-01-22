import 'dotenv/config';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import * as E from 'fp-ts/Either';
import { loadEnv } from '../env.js';
import { fetchBtcPrice, toAlpacaConfig } from '../alpaca.js';
import { createServer } from '../server.js';

const MIN_BTC_PRICE = 50000;

const requireEnv = () => {
  const env = loadEnv();
  if (E.isLeft(env)) {
    throw new Error(env.left.message);
  }
  return env.right;
};

describe('live Alpaca integration', () => {
  it(
    'fetches BTC price directly from Alpaca and enforces minimum threshold',
    async () => {
      const env = requireEnv();
      const priceResult = await fetchBtcPrice(toAlpacaConfig(env))();
      if (E.isLeft(priceResult)) {
        throw new Error(`Alpaca fetch failed: ${priceResult.left.message}`);
      }
      expect(priceResult.right).toBeGreaterThanOrEqual(MIN_BTC_PRICE);
    },
    20000
  );

  describe('http endpoint', () => {
    let server: ReturnType<typeof createServer> | null = null;
    let baseUrl = '';

    beforeAll(async () => {
      const env = requireEnv();
      server = createServer(toAlpacaConfig(env));

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

    it(
      'serves BTC price from /api/test and enforces minimum threshold',
      async () => {
        const response = await fetch(`${baseUrl}/api/test`);
        if (!response.ok) {
          const body = await response.text();
          throw new Error(`HTTP ${response.status}: ${body}`);
        }
        const payload = (await response.json()) as { price?: number; error?: string };
        if (payload.error) {
          throw new Error(`API error: ${payload.error}`);
        }
        expect(payload.price).toBeDefined();
        expect(payload.price as number).toBeGreaterThanOrEqual(MIN_BTC_PRICE);
      },
      20000
    );
  });
});
