import type { SingleOrArray } from 'yaschema';
import type { AnyStringSerializableType } from 'yaschema-api';

/** Converts a yaschema-api query value into a query string, which can be used in a URL */
export const makeQueryString = (query: Record<string, SingleOrArray<AnyStringSerializableType>>) => {
  const output: string[] = [];

  for (const [key, value] of Object.entries(query)) {
    if (value === null || value === undefined) {
      continue; // Skipping
    }

    if (Array.isArray(value)) {
      const encodedKey = `${encodeURIComponent(key)}[]`;
      for (const v of value) {
        if (v === null || v === undefined) {
          continue; // Skipping
        }

        output.push(`${encodedKey}=${encodeURIComponent(String(v))}`);
      }
    } else {
      const encodedKey = encodeURIComponent(key);
      output.push(`${encodedKey}=${encodeURIComponent(String(value))}`);
    }
  }

  return output.join('&');
};
