import * as E from 'fp-ts/lib/Either.js';
import { pipe } from 'fp-ts/lib/function.js';

export type Env = {
  alpacaApiKey: string;
  alpacaApiSecret: string;
  alpacaBaseUrl: string;
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

export const loadEnv = (): E.Either<Error, Env> =>
  pipe(
    E.Do,
    E.bind('alpacaApiKey', () => readEnv('ALPACA_API_KEY')),
    E.bind('alpacaApiSecret', () => readEnv('ALPACA_API_SECRET')),
    E.bind('alpacaBaseUrl', () =>
      E.right(process.env.ALPACA_BASE_URL ?? 'https://data.alpaca.markets')
    ),
    E.bind('port', () =>
      pipe(
        E.right(process.env.PORT ?? '3000'),
        E.chain(parsePort)
      )
    )
  );
