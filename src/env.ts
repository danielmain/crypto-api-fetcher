import * as E from 'fp-ts/lib/Either.js';
import { pipe } from 'fp-ts/lib/function.js';

export type Env = {
  freeCryptoApiKey: string;
  freeCryptoBaseUrl: string;
  priceCacheTtlMinutes: number;
  cryptoListCacheTtlMinutes: number;
  port: number;
};

const readEnv = (key: string): E.Either<Error, string> =>
  pipe(
    E.fromNullable(new Error(`Missing env var: ${key}`))(process.env[key]),
    E.map((value) => value.trim()),
    E.chain((value) =>
      value.length === 0
        ? E.left(new Error(`Missing env var: ${key}`))
        : E.right(value)
    )
  );

const parsePort = (value: string): E.Either<Error, number> => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0
    ? E.right(parsed)
    : E.left(new Error(`Invalid PORT: ${value}`));
};

const parseMinutes = (key: string, value: string): E.Either<Error, number> => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0
    ? E.right(parsed)
    : E.left(new Error(`Invalid ${key}: ${value}`));
};

export const loadEnv = (): E.Either<Error, Env> =>
  pipe(
    E.Do,
    E.bind('freeCryptoApiKey', () => readEnv('FREECRYPTO_API_KEY')),
    E.bind('freeCryptoBaseUrl', () =>
      E.right(
        process.env.FREECRYPTO_BASE_URL ?? 'https://api.freecryptoapi.com/v1'
      )
    ),
    E.bind('priceCacheTtlMinutes', () =>
      pipe(
        E.right(process.env.PRICE_CACHE_TTL_MINUTES ?? '15'),
        E.chain((value) => parseMinutes('PRICE_CACHE_TTL_MINUTES', value))
      )
    ),
    E.bind('cryptoListCacheTtlMinutes', () =>
      pipe(
        E.right(process.env.CRYPTO_LIST_CACHE_TTL_MINUTES ?? '1440'),
        E.chain((value) => parseMinutes('CRYPTO_LIST_CACHE_TTL_MINUTES', value))
      )
    ),
    E.bind('port', () =>
      pipe(
        E.right(process.env.PORT ?? '3000'),
        E.chain(parsePort)
      )
    )
  );
