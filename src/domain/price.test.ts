import { describe, expect, it } from 'vitest';
import * as E from 'fp-ts/lib/Either.js';
import { parseBtcPrice } from './price.js';

describe('parseBtcPrice', () => {
  it('returns ask price when present', () => {
    const payload = {
      quotes: {
        'BTC/USD': {
          ap: 42000.5
        }
      }
    };

    const result = parseBtcPrice(payload);
    expect(E.isRight(result)).toBe(true);
    if (E.isRight(result)) {
      expect(result.right).toBe(42000.5);
    }
  });

  it('falls back to bid price when ask is missing', () => {
    const payload = {
      quotes: {
        'BTC/USD': {
          bp: 41000
        }
      }
    };

    const result = parseBtcPrice(payload);
    expect(E.isRight(result)).toBe(true);
    if (E.isRight(result)) {
      expect(result.right).toBe(41000);
    }
  });
});
