import isPromise from 'is-promise';
import { type ValidationMode } from 'yaschema';
import {
  type AnyBody,
  type AnyHeaders,
  type AnyParams,
  type AnyQuery,
  anyReqParamsSchema,
  anyReqQuerySchema,
  type AnyStatus,
  type ApiRequest,
  type HttpApi
} from 'yaschema-api';

import { determineApiUrlUsingPreSerializedParts } from './api-fetch/internal/determine-api-url-using-pre-serialized-parts.js';

/** @throws if the request params or query are async-only schemas */
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
    (api.schemas.request.params ?? anyReqParamsSchema).serializeAsync((req.params ?? {}) as ReqParamsT, { validation: validationMode }),
    (api.schemas.request.query ?? anyReqQuerySchema).serializeAsync((req.query ?? {}) as ReqQueryT, { validation: validationMode })
  ];

  if (isPromise(reqParams) || isPromise(reqQuery)) {
    throw new Error('Use determineApiUrlAsync for async-only schemas');
  }

  return determineApiUrlUsingPreSerializedParts(api, {
    params: reqParams.serialized as AnyParams,
    query: reqQuery.serialized as AnyQuery
  });
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
