import type { ValidationMode } from 'yaschema';

let globalDefaultRequestValidation: ValidationMode = 'hard';
let globalDefaultResponseValidation: ValidationMode = 'hard';

/** Gets the default validation mode for requests */
export const getDefaultRequestValidationMode = () => globalDefaultRequestValidation;

/** Sets the default validation mode for requests */
export const setDefaultRequestValidationMode = (mode: ValidationMode) => {
  globalDefaultRequestValidation = mode;
};

/**
 * Gets the default validation mode for responses.
 *
 * Hard validation is always performed on responses statuses, regardless of this setting.
 */
export const getDefaultResponseValidationMode = () => globalDefaultResponseValidation;

/**
 * Sets the default validation mode for responses.
 *
 * Hard validation is always performed on responses statuses, regardless of this setting.
 */
export const setDefaultResponseValidationMode = (mode: ValidationMode) => {
  globalDefaultResponseValidation = mode;
};
