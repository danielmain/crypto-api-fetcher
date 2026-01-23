import * as E from 'fp-ts/lib/Either.js';
import * as A from 'fp-ts/lib/Array.js';
import * as O from 'fp-ts/lib/Option.js';
import { pipe } from 'fp-ts/lib/function.js';

export type AssetSymbol = {
  requestSymbol: string;
};

const SYMBOL_REGEX = /^[A-Z0-9]{1,10}$/;

const asRecord = (value: unknown): E.Either<Error, Record<string, unknown>> =>
  value !== null && typeof value === 'object'
    ? E.right(value as Record<string, unknown>)
    : E.left(new Error('Response payload is not an object'));

const asNumberLike = (value: unknown, path: string): E.Either<Error, number> => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return E.right(value);
  }
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed)
      ? E.right(parsed)
      : E.left(new Error(`Invalid numeric price at ${path}`));
  }
  return E.left(new Error(`Missing numeric price at ${path}`));
};

const asString = (value: unknown, path: string): E.Either<Error, string> =>
  typeof value === 'string'
    ? E.right(value)
    : E.left(new Error(`Missing string at ${path}`));

const ensureSymbolMatch = (
  root: Record<string, unknown>,
  expectedSymbol: string
): E.Either<Error, Record<string, unknown>> =>
  'symbol' in root
    ? pipe(
        asString(root.symbol, 'symbol'),
        E.chain((symbol) =>
          symbol === expectedSymbol
            ? E.right(root)
            : E.left(new Error(`Unexpected symbol: ${symbol}`))
        )
      )
    : E.right(root);

const asArray = (value: unknown): E.Either<Error, unknown[]> =>
  Array.isArray(value)
    ? E.right(value)
    : E.left(new Error('Expected array'));

const asRecordAt = (
  value: unknown,
  path: string
): E.Either<Error, Record<string, unknown>> =>
  value !== null && typeof value === 'object'
    ? E.right(value as Record<string, unknown>)
    : E.left(new Error(`Missing object at ${path}`));

const PRICE_KEYS = [
  'price',
  'last',
  'close',
  'rate',
  'last_price',
  'price_usd',
  'priceUsd'
] as const;

const getPriceFromRecord = (
  record: Record<string, unknown>,
  path: string
): E.Either<Error, number> => {
  for (const key of PRICE_KEYS) {
    if (key in record) {
      return asNumberLike(record[key], `${path}.${key}`);
    }
  }
  return E.left(new Error(`Missing numeric price at ${path}`));
};

const extractErrorMessage = (
  root: Record<string, unknown>
): E.Either<Error, string | null> => {
  const statusValue = root.status;
  const successValue = root.success;
  const statusIsError =
    statusValue === false ||
    statusValue === 'error' ||
    successValue === false;

  const errorValue = root.error;
  if (typeof errorValue === 'string' && errorValue.trim().length > 0) {
    return E.right(errorValue.trim());
  }

  const messageValue = root.message;
  if (
    typeof messageValue === 'string' &&
    messageValue.trim().length > 0 &&
    statusIsError
  ) {
    return E.right(messageValue.trim());
  }

  const msgValue = root.msg;
  if (
    typeof msgValue === 'string' &&
    msgValue.trim().length > 0 &&
    statusIsError
  ) {
    return E.right(msgValue.trim());
  }

  return E.right(null);
};

const extractPriceFromObject = (
  root: Record<string, unknown>,
  expectedSymbol: string,
  path: string
): E.Either<Error, number> =>
  pipe(
    ensureSymbolMatch(root, expectedSymbol),
    E.chain((record) => getPriceFromRecord(record, path))
  );

const extractPrice = (
  payload: unknown,
  expectedSymbol: string
): E.Either<Error, number> =>
  pipe(
    payload,
    asRecord,
    E.chain((root) =>
      pipe(
        extractErrorMessage(root),
        E.chain((errorMessage) =>
          errorMessage ? E.left(new Error(errorMessage)) : E.right(root)
        )
      )
    ),
    E.chain((root) => {
      if ('price' in root) {
        return extractPriceFromObject(root, expectedSymbol, 'payload');
      }
      if ('symbols' in root && Array.isArray(root.symbols)) {
        return pipe(
          asArray(root.symbols),
          E.chain((items) =>
            items.length === 0
              ? E.left(new Error('Missing price data'))
              : pipe(
                  items,
                  A.findFirstMap((item) =>
                    pipe(
                      asRecordAt(item, 'symbols[]'),
                      E.chain((record) =>
                        extractPriceFromObject(
                          record,
                          expectedSymbol,
                          'symbols[]'
                        )
                      ),
                      E.fold(
                        () => O.none,
                        (price) => O.some(price)
                      )
                    )
                  ),
                  (match) =>
                    O.isSome(match)
                      ? E.right(match.value)
                      : pipe(
                          asRecordAt(items[0], 'symbols[0]'),
                          E.chain((record) =>
                            extractPriceFromObject(
                              record,
                              expectedSymbol,
                              'symbols[0]'
                            )
                          )
                        )
                )
          )
        );
      }
      if ('data' in root) {
        const data = root.data;
        if (Array.isArray(data)) {
          return pipe(
            data,
            asArray,
            E.chain((items) =>
              items.length === 0
                ? E.left(new Error('Missing price data'))
                : pipe(
                    items,
                    A.findFirstMap((item) =>
                      pipe(
                        asRecordAt(item, 'data[]'),
                        E.chain((record) =>
                          extractPriceFromObject(record, expectedSymbol, 'data[]')
                        ),
                        E.fold(
                          () => O.none,
                          (price) => O.some(price)
                        )
                      )
                    ),
                    (match) =>
                      O.isSome(match)
                        ? E.right(match.value)
                        : pipe(
                            asRecordAt(items[0], 'data[0]'),
                            E.chain((record) =>
                              extractPriceFromObject(
                                record,
                                expectedSymbol,
                                'data[0]'
                              )
                            )
                          )
                  )
            )
          );
        }
        if (data !== null && typeof data === 'object') {
          const dataRecord = data as Record<string, unknown>;
          if (expectedSymbol in dataRecord) {
            return pipe(
              asRecordAt(dataRecord[expectedSymbol], `data.${expectedSymbol}`),
              E.chain((record) =>
                extractPriceFromObject(
                  record,
                  expectedSymbol,
                  `data.${expectedSymbol}`
                )
              )
            );
          }
          return extractPriceFromObject(dataRecord, expectedSymbol, 'data');
        }
      }
      if ('result' in root) {
        return pipe(
          asRecordAt(root.result, 'result'),
          E.chain((record) =>
            extractPriceFromObject(record, expectedSymbol, 'result')
          )
        );
      }
      return E.left(new Error('Missing numeric price at price'));
    })
  );

export const parseAssetSymbol = (
  rawSymbol: string
): E.Either<Error, AssetSymbol> =>
  pipe(
    rawSymbol,
    E.fromPredicate(
      (value) => SYMBOL_REGEX.test(value),
      () => new Error('Symbol must be uppercase alphanumeric (e.g., BTC)')
    ),
    E.map((symbol) => ({
      requestSymbol: symbol
    }))
  );

export const parseAssetPrice = (
  payload: unknown,
  expectedSymbol: string
): E.Either<Error, number> =>
  extractPrice(payload, expectedSymbol);
