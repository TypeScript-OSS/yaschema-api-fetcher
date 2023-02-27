import type { AnyStringSerializableType } from 'yaschema-api';

/** Converts headers from the format return by `fetch` to the format expected by yaschema-api */
export const convertHeadersFromFetchResponse = (fetchHeaders: Headers) => {
  const output: Record<string, AnyStringSerializableType> = {};

  fetchHeaders.forEach((value, key) => {
    output[key.toLowerCase()] = value;
  });

  return output;
};
