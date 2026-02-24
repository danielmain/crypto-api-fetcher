import { describe, expect, it, vi } from 'vitest';
import * as E from 'fp-ts/lib/Either.js';
import * as TE from 'fp-ts/lib/TaskEither.js';
import { parseAssetId } from './domain/price.js';

const config = {
  baseUrl: 'https://api.coingecko.com/api/v3',
  apiKey: 'test-key'
};

const getAssetId = (raw: string) => {
  const parsed = parseAssetId(raw);
  if (E.isLeft(parsed)) {
    throw new Error(parsed.left.message);
  }
  return parsed.right;
};

const loadCacheModule = async (mockFetch: ReturnType<typeof vi.fn>) => {
  vi.doMock('./coingecko.js', () => ({
    fetchAssetPrice: mockFetch,
    fetchCryptoList: vi.fn()
  }));
  return import('./price-cache.js');
};

describe('getCachedAssetPrice', () => {
  it('caches the price for the same asset id within TTL', async () => {
    vi.resetModules();
    const mockFetch = vi.fn().mockReturnValue(TE.right(123));
    const { createPriceCache } = await loadCacheModule(mockFetch);
    const { getCachedAssetPrice } = createPriceCache(60_000);

    const assetId = getAssetId('ethereum');
    await getCachedAssetPrice(config, assetId)();
    await getCachedAssetPrice(config, assetId)();

    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('keeps cache entries isolated per asset id', async () => {
    vi.resetModules();
    const mockFetch = vi.fn().mockReturnValue(TE.right(456));
    const { createPriceCache } = await loadCacheModule(mockFetch);
    const { getCachedAssetPrice } = createPriceCache(60_000);

    await getCachedAssetPrice(config, getAssetId('ethereum'))();
    await getCachedAssetPrice(config, getAssetId('bitcoin'))();

    expect(mockFetch).toHaveBeenCalledTimes(2);
  });
});
