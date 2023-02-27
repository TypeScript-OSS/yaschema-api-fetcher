import type { AnyStringSerializableType } from 'yaschema-api';

/** Converts headers from the format expected by yaschema-api to the format expected by `fetch` */
export const convertHeadersForFetchRequest = (headers: Record<string, AnyStringSerializableType>) => {
  const output = Object.entries(headers).reduce((out: Record<string, string>, [key, value]) => {
    if (value === null || value === undefined) {
      return out; // Skipping
    }

    out[key.toLowerCase()] = String(value);
    return out;
  }, {});

  if (output['content-type'] === undefined) {
    output['content-type'] = 'application/json';
  }

  return output;
};
