import { describe, expect, it } from 'vitest';
import * as E from 'fp-ts/lib/Either.js';
import { parseAssetPrice, parseAssetSymbol } from './price.js';

describe('parseAssetPrice', () => {
  it('returns price when present', () => {
    const payload = {
      symbol: 'ETH',
      price: 42000.5
    };

    const result = parseAssetPrice(payload, 'ETH');
    expect(E.isRight(result)).toBe(true);
    if (E.isRight(result)) {
      expect(result.right).toBe(42000.5);
    }
  });

  it('reads price from data wrapper with string values', () => {
    const payload = {
      status: true,
      data: {
        symbol: 'ETH',
        price: '42000.5'
      }
    };

    const result = parseAssetPrice(payload, 'ETH');
    expect(E.isRight(result)).toBe(true);
    if (E.isRight(result)) {
      expect(result.right).toBe(42000.5);
    }
  });

  it('reads price from data array', () => {
    const payload = {
      status: true,
      data: [{ symbol: 'SOL', price: 123.45 }]
    };

    const result = parseAssetPrice(payload, 'SOL');
    expect(E.isRight(result)).toBe(true);
    if (E.isRight(result)) {
      expect(result.right).toBe(123.45);
    }
  });

  it('reads price from symbols array with last field', () => {
    const payload = {
      status: 'success',
      symbols: [
        {
          symbol: 'ETH',
          last: '2948.58'
        }
      ]
    };

    const result = parseAssetPrice(payload, 'ETH');
    expect(E.isRight(result)).toBe(true);
    if (E.isRight(result)) {
      expect(result.right).toBe(2948.58);
    }
  });

  it('reads price from alternate keys', () => {
    const payload = {
      data: {
        symbol: 'BTC',
        close: '65000.01'
      }
    };

    const result = parseAssetPrice(payload, 'BTC');
    expect(E.isRight(result)).toBe(true);
    if (E.isRight(result)) {
      expect(result.right).toBe(65000.01);
    }
  });

  it('rejects mismatched symbols when provided', () => {
    const payload = {
      symbol: 'SOL',
      price: 41000
    };

    const result = parseAssetPrice(payload, 'ADA');
    expect(E.isLeft(result)).toBe(true);
  });

  it('surfaces upstream error messages', () => {
    const payload = {
      status: false,
      message: 'Invalid API key'
    };

    const result = parseAssetPrice(payload, 'BTC');
    expect(E.isLeft(result)).toBe(true);
    if (E.isLeft(result)) {
      expect(result.left.message).toBe('Invalid API key');
    }
  });
});

describe('parseAssetSymbol', () => {
  it('accepts uppercase asset symbols', () => {
    const result = parseAssetSymbol('ADA');
    expect(E.isRight(result)).toBe(true);
    if (E.isRight(result)) {
      expect(result.right).toEqual({
        requestSymbol: 'ADA'
      });
    }
  });

  it('rejects invalid symbol formats', () => {
    const result = parseAssetSymbol('eth-usd');
    expect(E.isLeft(result)).toBe(true);
  });
});
