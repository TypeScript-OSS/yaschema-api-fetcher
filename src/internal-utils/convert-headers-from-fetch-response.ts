import type { AnyHeaders } from 'yaschema-api';

/** Converts headers from the format return by `fetch` to the format expected by yaschema-api */
export const convertHeadersFromFetchResponse = (fetchHeaders: Headers) => {
  const output: Exclude<AnyHeaders, undefined> = {};

  fetchHeaders.forEach((value, key) => {
    output[key.toLowerCase()] = value;
  });

  return output;
};
