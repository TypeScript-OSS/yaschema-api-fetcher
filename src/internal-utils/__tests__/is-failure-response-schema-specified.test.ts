import { schema } from 'yaschema';

import { isFailureResponseSchemaSpecified } from '../is-failure-response-schema-specified.js';

describe('isFailureResponseSchemaSpecified', () => {
  it('should work with undefined', () => {
    expect(isFailureResponseSchemaSpecified(undefined)).toBeFalsy();
  });

  it('should work with empty schemas', () => {
    expect(isFailureResponseSchemaSpecified({})).toBeFalsy();
  });

  it('should work with non-empty schemas', () => {
    expect(isFailureResponseSchemaSpecified({ status: schema.number() })).toBeTruthy();
  });
});
