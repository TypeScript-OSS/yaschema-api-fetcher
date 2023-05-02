import type { AnyBody } from 'yaschema-api';

import { getBlobConstructor } from '../config/blob-constructor';
import { getFormDataConstructor } from '../config/form-data-constructor';
import { primitivesTypes } from './primative-types';

/** Converts a yaschema-api body value into `FormData`.  The body must be `undefined`, `null`, or an object. */
export const makeFormData = (body: AnyBody) => {
  const FormData = getFormDataConstructor();
  if (FormData === undefined) {
    throw new Error(
      "FormData hasn't been configured.  With node.js, setFetch, setFormDataConstructor, and setBlobConstructor must be used to configure yaschema-api-fetcher for form-data"
    );
  }
  const output = new FormData();

  if (body === undefined || body === null) {
    return output;
  }

  if (typeof body !== 'object') {
    throw new Error('The body must be an object, undefined, or null, for form-data requests');
  }

  for (const [key, value] of Object.entries((body as Record<string, any>) ?? {})) {
    if (value === null || value === undefined) {
      continue; // Skipping
    }

    if (Array.isArray(value)) {
      const encodedKey = `${key}[]`;
      for (const v of value) {
        if (v === null || v === undefined) {
          continue; // Skipping
        }

        output.append(encodedKey, encodeFieldValue(v));
      }
    } else {
      output.append(key, encodeFieldValue(value));
    }
  }

  return output;
};

// Helpers

/** Encodes primitives using `String(…)`.  Files are returned as-is.  Encodes anything else using `'yaschema/json:' + JSON.stringify(…)` */
const encodeFieldValue = (value: any) => {
  if (value === null || value === undefined) {
    // This shouldn't happen because we pre-check if value is null/undefined before calling this function
    return String(value);
  }

  const type = typeof value;
  if (primitivesTypes.has(type)) {
    return String(value);
  }

  const BlobConstructor = getBlobConstructor();
  if (BlobConstructor === undefined) {
    throw new Error(
      "Blob hasn't been configured.  With node.js, setFetch, setFormDataConstructor, and setBlobConstructor must be used to configure yaschema-api-fetcher for form-data"
    );
  }

  if (value instanceof BlobConstructor) {
    return value;
  } else {
    return `yaschema/json:${JSON.stringify(value)}`;
  }
};
