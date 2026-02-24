import * as E from 'fp-ts/lib/Either.js';
import { pipe } from 'fp-ts/lib/function.js';

export type AssetId = {
  requestId: string;
};

const ID_REGEX = /^[a-z0-9-]{1,64}$/;

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

const extractErrorMessage = (
  root: Record<string, unknown>
): E.Either<Error, string | null> => {
  if (typeof root.error === 'string' && root.error.trim().length > 0) {
    return E.right(root.error.trim());
  }

  const status = root.status;
  if (status !== null && typeof status === 'object') {
    const statusRecord = status as Record<string, unknown>;
    if (
      typeof statusRecord.error_message === 'string' &&
      statusRecord.error_message.trim().length > 0
    ) {
      return E.right(statusRecord.error_message.trim());
    }
  }

  return E.right(null);
};

export const parseAssetId = (rawId: string): E.Either<Error, AssetId> =>
  pipe(
    rawId,
    E.fromPredicate(
      (value) => ID_REGEX.test(value),
      () => new Error('Asset id must be lowercase letters, numbers, or hyphens (e.g., bitcoin)')
    ),
    E.map((id) => ({
      requestId: id
    }))
  );

export const parseAssetPrice = (
  payload: unknown,
  expectedId: string
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
      if (!(expectedId in root)) {
        return E.left(new Error(`Missing coin id in response: ${expectedId}`));
      }

      const assetValue = root[expectedId];
      return pipe(
        asRecord(assetValue),
        E.chain((assetRecord) => {
          if (!('usd' in assetRecord)) {
            return E.left(new Error(`Missing numeric price at ${expectedId}.usd`));
          }
          return asNumberLike(assetRecord.usd, `${expectedId}.usd`);
        })
      );
    })
  );
