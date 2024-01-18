import _ from 'lodash';
import type { ValidationMode } from 'yaschema';
import { schema } from 'yaschema';
import type {
  AnyBody,
  AnyHeaders,
  AnyParams,
  AnyQuery,
  AnyStatus,
  ApiRequest,
  GenericApiRequest,
  GenericHttpApi,
  HttpApi
} from 'yaschema-api';
import { checkRequestValidation } from 'yaschema-api';

import { triggerOnRequestValidationErrorHandler } from '../../../config/on-request-validation-error';
import { convertHeadersForFetchRequest } from '../../../internal-utils/convert-headers-for-fetch-request';
import { encodeBody } from '../../../internal-utils/encode-body';
import type { EncodedRequestBody } from '../../types/EncodedRequestBody';
import { FetchRequirementsError } from '../../types/FetchRequirementsError';
import { determineApiUrlUsingPreSerializedParts } from './determine-api-url-using-pre-serialized-parts';

const anyStringSerializableTypeSchema = schema.oneOf3(
  schema.number().setAllowedSerializationForms(['number', 'string']),
  schema.boolean().setAllowedSerializationForms(['boolean', 'string']),
  schema.string()
);

const anyReqHeadersSchema = schema.record(schema.string(), anyStringSerializableTypeSchema).optional();
const anyReqParamsSchema = schema.record(schema.string(), anyStringSerializableTypeSchema).optional();
const anyReqQuerySchema = schema
  .record(schema.string(), schema.oneOf(anyStringSerializableTypeSchema, schema.array({ items: anyStringSerializableTypeSchema })))
  .optional();
const anyReqBodySchema = schema.any().allowNull().optional();

/** Generates the requirements needed to call `fetch`.  If the request shouldn't be made because of an error, this throws a
 * `FetchRequirementsError` */
export const generateFetchRequirementsFromApiFetchRequest = async <
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
  req: ApiRequest<ReqHeadersT, ReqParamsT, ReqQueryT, ReqBodyT>,
  { validationMode }: { validationMode: ValidationMode }
): Promise<{ url: URL; headers: Record<string, string>; body: EncodedRequestBody }> => {
  const [reqHeaders, reqParams, reqQuery, reqBody] = await Promise.all([
    (api.schemas.request.headers ?? anyReqHeadersSchema).serializeAsync((req.headers ?? {}) as ReqHeadersT, {
      validation: validationMode
    }),
    (api.schemas.request.params ?? anyReqParamsSchema).serializeAsync((req.params ?? {}) as ReqParamsT, {
      validation: validationMode
    }),
    (api.schemas.request.query ?? anyReqQuerySchema).serializeAsync((req.query ?? {}) as ReqQueryT, {
      validation: validationMode
    }),
    (api.schemas.request.body ?? anyReqBodySchema).serializeAsync(req.body as ReqBodyT, { validation: validationMode })
  ]);

  if (validationMode !== 'none') {
    const checkedRequestValidation = checkRequestValidation({
      reqHeaders,
      reqParams,
      reqQuery,
      reqBody,
      validationMode
    });
    if (!checkedRequestValidation.ok || checkedRequestValidation.hadSoftValidationError) {
      triggerOnRequestValidationErrorHandler({
        api: api as any as GenericHttpApi,
        req: req as GenericApiRequest,
        invalidPart: checkedRequestValidation.invalidPart,
        validationError: checkedRequestValidation.validationError
      });
    }
    if (!checkedRequestValidation.ok) {
      throw new FetchRequirementsError(
        `Request ${checkedRequestValidation.invalidPart} validation error: ${checkedRequestValidation.validationError}`
      );
    }
  }

  const convertedHeaders = convertHeadersForFetchRequest({
    requestType: api.requestType,
    headers: reqHeaders.serialized as AnyHeaders
  });

  let encodedBody: EncodedRequestBody;
  try {
    encodedBody = reqBody.serialized !== undefined ? encodeBody({ requestType: api.requestType, body: reqBody.serialized }) : undefined;
  } catch (e) {
    throw new FetchRequirementsError(_.get(e, 'message') ?? '');
  }

  const url = await determineApiUrlUsingPreSerializedParts(api, {
    params: reqParams.serialized as AnyParams,
    query: reqQuery.serialized as AnyQuery
  });

  return { url, headers: convertedHeaders, body: encodedBody };
};
