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
import { checkRequestValidation, getUrlBaseForRouteType } from 'yaschema-api';

import { triggerOnRequestValidationErrorHandler } from '../../config/on-request-validation-error';
import { convertHeadersForFetchRequest } from '../../internal-utils/convert-headers-for-fetch-request';
import { makeQueryString } from '../../internal-utils/make-query-string';
import { populateParamMarkersInUrl } from '../../internal-utils/populate-param-markers-in-url';

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

export class FetchRequirementsError extends Error {
  constructor(message: string) {
    super(message);
  }
}

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
): Promise<{ url: URL; headers: Record<string, string>; body: string | undefined }> => {
  const [reqHeaders, reqParams, reqQuery, reqBody] = await Promise.all([
    await (api.schemas.request.headers ?? anyReqHeadersSchema).serializeAsync((req.headers ?? {}) as ReqHeadersT, {
      validation: validationMode
    }),
    await (api.schemas.request.params ?? anyReqParamsSchema).serializeAsync((req.params ?? {}) as ReqParamsT, {
      validation: validationMode
    }),
    await (api.schemas.request.query ?? anyReqQuerySchema).serializeAsync((req.query ?? {}) as ReqQueryT, {
      validation: validationMode
    }),
    await (api.schemas.request.body ?? anyReqBodySchema).serializeAsync(req.body as ReqBodyT, { validation: validationMode })
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

  const queryString = makeQueryString(reqQuery.serialized as AnyQuery);
  let paramPopulatedUrl: string;
  try {
    paramPopulatedUrl = populateParamMarkersInUrl(api.url, reqParams.serialized as AnyParams);
  } catch (e) {
    throw new FetchRequirementsError(_.get(e, 'message') ?? '');
  }
  const constructedUrl = `${paramPopulatedUrl}${queryString.length > 0 ? '?' : ''}${queryString}`;

  const convertedHeaders = convertHeadersForFetchRequest(reqHeaders.serialized as AnyHeaders);
  const stringifiedBody = reqBody.serialized !== undefined ? JSON.stringify(reqBody.serialized) : undefined;

  const urlBase = getUrlBaseForRouteType(api.routeType);
  const url = new URL(constructedUrl, urlBase.length === 0 ? undefined : urlBase);

  return { url, headers: convertedHeaders, body: stringifiedBody };
};
