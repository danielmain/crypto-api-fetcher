import * as E from 'fp-ts/Either';
import { pipe } from 'fp-ts/function';

const asRecord = (value: unknown): E.Either<Error, Record<string, unknown>> =>
  value !== null && typeof value === 'object'
    ? E.right(value as Record<string, unknown>)
    : E.left(new Error('Response payload is not an object'));

const asNumber = (value: unknown, path: string): E.Either<Error, number> =>
  typeof value === 'number' && Number.isFinite(value)
    ? E.right(value)
    : E.left(new Error(`Missing numeric price at ${path}`));

export const parseBtcPrice = (payload: unknown): E.Either<Error, number> =>
  pipe(
    payload,
    asRecord,
    E.chain((root) => asRecord(root.quotes)),
    E.chain((quotes) => asRecord(quotes['BTC/USD'])),
    E.chain((quote) =>
      pipe(
        asNumber(quote.ap, 'quotes.BTC/USD.ap'),
        E.orElse(() => asNumber(quote.bp, 'quotes.BTC/USD.bp')),
        E.orElse(() => asNumber(quote.p, 'quotes.BTC/USD.p'))
      )
    )
  );
