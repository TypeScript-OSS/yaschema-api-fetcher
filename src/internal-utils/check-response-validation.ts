import type { DeserializationResult, ValidationMode } from 'yaschema';
import type { AnyStringSerializableType } from 'yaschema-api';

import type { GenericApiResponse } from '../types/GenericApiResponse';

/** Determines response schema validation results and conceptually returns one of three states: valid, invalid (soft validation error), or
 * invalid (hard validation error).  For invalid cases, additional metadata is included in the result. */
export const checkResponseValidation = ({
  resHeaders,
  resBody,
  validationMode
}: {
  resHeaders: DeserializationResult<Partial<Record<string, AnyStringSerializableType>>>;
  resBody: DeserializationResult<any>;
  validationMode: ValidationMode;
}):
  | ({ ok: true } & (
      | { hadSoftValidationError: false; invalidPart?: undefined; validationError?: undefined }
      | { hadSoftValidationError: true; invalidPart: keyof GenericApiResponse; validationError: string }
    ))
  | { ok: false; invalidPart: keyof GenericApiResponse; validationError: string } => {
  if (resHeaders.error !== undefined) {
    if (validationMode === 'hard') {
      return { ok: false, invalidPart: 'headers', validationError: resHeaders.error };
    } else {
      return { ok: true, hadSoftValidationError: true, invalidPart: 'headers', validationError: resHeaders.error };
    }
  }

  if (resBody.error !== undefined) {
    if (validationMode === 'hard') {
      return { ok: false, invalidPart: 'body', validationError: resBody.error };
    } else {
      return { ok: true, hadSoftValidationError: true, invalidPart: 'body', validationError: resBody.error };
    }
  }

  return { ok: true, hadSoftValidationError: false };
};
