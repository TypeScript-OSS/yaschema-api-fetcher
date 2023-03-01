import type { AnyBody, AnyHeaders, AnyStatus, ResponseSchemas } from 'yaschema-api';

/** Determines if the failure response schema is really specified.  To be considered as specified, the schemas must be defined and at least
 * one of: `status`, `headers`, and/or `body` must also be defined. */
export const isFailureResponseSchemaSpecified = <StatusT extends AnyStatus, HeadersT extends AnyHeaders, BodyT extends AnyBody>(
  responseSchema: ResponseSchemas<StatusT, HeadersT, BodyT> | undefined
) =>
  responseSchema !== undefined &&
  (responseSchema.status !== undefined || responseSchema.headers !== undefined || responseSchema.body !== undefined);
