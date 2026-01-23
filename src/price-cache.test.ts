import { describe, expect, it, vi } from 'vitest';
import * as E from 'fp-ts/lib/Either.js';
import * as TE from 'fp-ts/lib/TaskEither.js';
import { parseAssetSymbol } from './domain/price.js';

const config = {
  baseUrl: 'https://api.freecryptoapi.com/v1',
  apiKey: 'test-key'
};

const getSymbol = (raw: string) => {
  const parsed = parseAssetSymbol(raw);
  if (E.isLeft(parsed)) {
    throw new Error(parsed.left.message);
  }
  return parsed.right;
};

const loadCacheModule = async (mockFetch: ReturnType<typeof vi.fn>) => {
  vi.doMock('./freecrypto.js', () => ({
    fetchAssetPrice: mockFetch,
    fetchCryptoList: vi.fn()
  }));
  return import('./price-cache.js');
};

describe('getCachedAssetPrice', () => {
  it('caches the price for the same symbol within TTL', async () => {
    vi.resetModules();
    const mockFetch = vi.fn().mockReturnValue(TE.right(123));
    const { createPriceCache } = await loadCacheModule(mockFetch);
    const { getCachedAssetPrice } = createPriceCache(60_000);

    const symbol = getSymbol('ETH');
    await getCachedAssetPrice(config, symbol)();
    await getCachedAssetPrice(config, symbol)();

    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('keeps cache entries isolated per symbol', async () => {
    vi.resetModules();
    const mockFetch = vi.fn().mockReturnValue(TE.right(456));
    const { createPriceCache } = await loadCacheModule(mockFetch);
    const { getCachedAssetPrice } = createPriceCache(60_000);

    await getCachedAssetPrice(config, getSymbol('ETH'))();
    await getCachedAssetPrice(config, getSymbol('SOL'))();

    expect(mockFetch).toHaveBeenCalledTimes(2);
  });
});
