import { describe, expect, it } from 'vitest';
import * as E from 'fp-ts/lib/Either.js';
import { parseAssetPrice, parseAssetId } from './price.js';

describe('parseAssetPrice', () => {
  it('returns price when present', () => {
    const payload = {
      bitcoin: {
        usd: 42000.5
      }
    };

    const result = parseAssetPrice(payload, 'bitcoin');
    expect(E.isRight(result)).toBe(true);
    if (E.isRight(result)) {
      expect(result.right).toBe(42000.5);
    }
  });

  it('reads numeric string prices', () => {
    const payload = {
      ethereum: {
        usd: '2948.58'
      }
    };

    const result = parseAssetPrice(payload, 'ethereum');
    expect(E.isRight(result)).toBe(true);
    if (E.isRight(result)) {
      expect(result.right).toBe(2948.58);
    }
  });

  it('fails when requested coin id is missing', () => {
    const payload = {
      bitcoin: {
        usd: 65000.01
      }
    };

    const result = parseAssetPrice(payload, 'cardano');
    expect(E.isLeft(result)).toBe(true);
  });

  it('surfaces upstream error messages', () => {
    const payload = {
      error: 'Invalid API key'
    };

    const result = parseAssetPrice(payload, 'bitcoin');
    expect(E.isLeft(result)).toBe(true);
    if (E.isLeft(result)) {
      expect(result.left.message).toBe('Invalid API key');
    }
  });
});

describe('parseAssetId', () => {
  it('accepts lowercase coin ids', () => {
    const result = parseAssetId('bitcoin');
    expect(E.isRight(result)).toBe(true);
    if (E.isRight(result)) {
      expect(result.right).toEqual({
        requestId: 'bitcoin'
      });
    }
  });

  it('accepts lowercase ids with hyphens', () => {
    const result = parseAssetId('wrapped-steth');
    expect(E.isRight(result)).toBe(true);
  });

  it('rejects invalid id formats', () => {
    const result = parseAssetId('BTC');
    expect(E.isLeft(result)).toBe(true);
  });
});
