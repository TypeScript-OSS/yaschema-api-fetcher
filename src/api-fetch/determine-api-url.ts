import { schema, type ValidationMode } from 'yaschema';
import type { AnyBody, AnyHeaders, AnyParams, AnyQuery, AnyStatus, ApiRequest, HttpApi } from 'yaschema-api';

import { determineApiUrlUsingPreSerializedParts } from './api-fetch/internal/determine-api-url-using-pre-serialized-parts.js';

const anyStringSerializableTypeSchema = schema.oneOf3(
  schema.number().setAllowedSerializationForms(['number', 'string']),
  schema.boolean().setAllowedSerializationForms(['boolean', 'string']),
  schema.string()
);

const anyReqParamsSchema = schema.record(schema.string(), anyStringSerializableTypeSchema).optional();
const anyReqQuerySchema = schema
  .record(schema.string(), schema.oneOf(anyStringSerializableTypeSchema, schema.array({ items: anyStringSerializableTypeSchema })))
  .optional();

export const determineApiUrl = <
  ReqHeadersT extends AnyHeaders,
  ReqParamsT extends AnyParams,
  ReqQueryT extends AnyQuery,
  ReqBodyT extends AnyBody,
  ResStatusT extends AnyStatus,
  ResHeadersT extends AnyHeaders,
  ResBodyT extends AnyBody,
  ErrResStatusT extends AnyStatus,
  ErrResHeadersT extends AnyHeaders,
  ErrResBodyT extends AnyBody
>(
  api: HttpApi<ReqHeadersT, ReqParamsT, ReqQueryT, ReqBodyT, ResStatusT, ResHeadersT, ResBodyT, ErrResStatusT, ErrResHeadersT, ErrResBodyT>,
  req: Pick<ApiRequest<ReqHeadersT, ReqParamsT, ReqQueryT, ReqBodyT>, 'params' | 'query'>,
  { validationMode }: { validationMode: ValidationMode }
): URL => {
  const [reqParams, reqQuery] = [
    (api.schemas.request.params ?? anyReqParamsSchema).serialize((req.params ?? {}) as ReqParamsT, { validation: validationMode }),
    (api.schemas.request.query ?? anyReqQuerySchema).serialize((req.query ?? {}) as ReqQueryT, { validation: validationMode })
  ];

  return determineApiUrlUsingPreSerializedParts(api, { params: reqParams.serialized as AnyParams, query: reqQuery.serialized as AnyQuery });
};

export const determineApiUrlAsync = async <
  ReqHeadersT extends AnyHeaders,
  ReqParamsT extends AnyParams,
  ReqQueryT extends AnyQuery,
  ReqBodyT extends AnyBody,
  ResStatusT extends AnyStatus,
  ResHeadersT extends AnyHeaders,
  ResBodyT extends AnyBody,
  ErrResStatusT extends AnyStatus,
  ErrResHeadersT extends AnyHeaders,
  ErrResBodyT extends AnyBody
>(
  api: HttpApi<ReqHeadersT, ReqParamsT, ReqQueryT, ReqBodyT, ResStatusT, ResHeadersT, ResBodyT, ErrResStatusT, ErrResHeadersT, ErrResBodyT>,
  req: Pick<ApiRequest<ReqHeadersT, ReqParamsT, ReqQueryT, ReqBodyT>, 'params' | 'query'>,
  { validationMode }: { validationMode: ValidationMode }
): Promise<URL> => {
  const [reqParams, reqQuery] = await Promise.all([
    (api.schemas.request.params ?? anyReqParamsSchema).serializeAsync((req.params ?? {}) as ReqParamsT, {
      validation: validationMode
    }),
    (api.schemas.request.query ?? anyReqQuerySchema).serializeAsync((req.query ?? {}) as ReqQueryT, {
      validation: validationMode
    })
  ]);

  return determineApiUrlUsingPreSerializedParts(api, { params: reqParams.serialized as AnyParams, query: reqQuery.serialized as AnyQuery });
};
