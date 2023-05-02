import type { AnyQuery } from 'yaschema-api';

/** Converts a yaschema-api query value into a query string, which can be used in a URL */
export const makeQueryString = (query: AnyQuery) => {
  const output: string[] = [];

  for (const [key, value] of Object.entries(query ?? {})) {
    if (value === null || value === undefined) {
      continue; // Skipping
    }

    if (Array.isArray(value)) {
      const encodedKey = `${encodeURIComponent(key)}[]`;
      for (const v of value) {
        if (v === null || v === undefined) {
          continue; // Skipping
        }

        output.push(`${encodedKey}=${encodeFieldValue(v)}`);
      }
    } else {
      const encodedKey = encodeURIComponent(key);
      output.push(`${encodedKey}=${encodeFieldValue(value)}`);
    }
  }

  return output.join('&');
};

// Helpers

/** Encodes values using `encodeURIComponent(String(…))` */
const encodeFieldValue = (value: any) => encodeURIComponent(String(value));
