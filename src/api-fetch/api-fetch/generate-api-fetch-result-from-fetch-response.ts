import type { SingleOrArray, ValidationMode } from 'yaschema';
import { schema } from 'yaschema';
import type { AnyStringSerializableType, GenericHttpApi, HttpApi, ResponseSchemas } from 'yaschema-api';

import { triggerOnResponseValidationErrorHandler } from '../../config/on-response-validation-error';
import { checkResponseValidation } from '../../internal-utils/check-response-validation';
import { convertHeadersFromFetchResponse } from '../../internal-utils/convert-headers-from-fetch-response';
import { getBestResponseContentByType } from '../../internal-utils/get-best-response-content-by-type';
import { isFailureResponseSchemaSpecified } from '../../internal-utils/is-failure-response-schema-specified';
import type { ApiRequest } from '../../types/ApiRequest';
import type { ApiResponse } from '../../types/ApiResponse';
import type { GenericApiResponse } from '../../types/GenericApiResponse';
import type { ApiFetchResult } from '../exports';
import type { SupportedHttpResponseType } from './is-unsupported-http-response-type';

const anyStringSerializableTypeSchema = schema.oneOf3(
  schema.number().setAllowedSerializationForms(['number', 'string']),
  schema.boolean().setAllowedSerializationForms(['boolean', 'string']),
  schema.string()
);

const anyResStatusSchema = schema.number();
const anyResHeadersSchema = schema.record(schema.string(), anyStringSerializableTypeSchema);
const anyResBodySchema = schema.any().allowNull().optional();

/** Checks the response returned by `fetch`, comparing it with the success and failure schemas, and generates the most-appropriate
 * `ApiFetchResult` */
export const generateApiFetchResultFromFetchResponse = async <
  ReqHeadersT extends Record<string, AnyStringSerializableType>,
  ReqParamsT extends Record<string, AnyStringSerializableType>,
  ReqQueryT extends Record<string, SingleOrArray<AnyStringSerializableType>>,
  ReqBodyT,
  ResStatusT extends number,
  ResHeadersT extends Record<string, AnyStringSerializableType>,
  ResBodyT,
  ErrResStatusT extends number,
  ErrResHeadersT extends Record<string, AnyStringSerializableType>,
  ErrResBodyT
>(
  api: HttpApi<ReqHeadersT, ReqParamsT, ReqQueryT, ReqBodyT, ResStatusT, ResHeadersT, ResBodyT, ErrResStatusT, ErrResHeadersT, ErrResBodyT>,
  req: ApiRequest<ReqHeadersT, ReqParamsT, ReqQueryT, ReqBodyT>,
  {
    fetchRes,
    validationMode
  }: {
    fetchRes: Response;
    validationMode: ValidationMode;
  }
): Promise<ApiFetchResult<ResStatusT, ResHeadersT, ResBodyT, ErrResStatusT, ErrResHeadersT, ErrResBodyT>> => {
  // Pre-checked for SupportedHttpResponseType compatibility in caller
  const responseType = (api.responseType ?? 'json') as SupportedHttpResponseType;

  const checkFetchResponseContentAgainstSchema = async <
    ResStatusT extends number,
    ResHeadersT extends Record<string, AnyStringSerializableType>,
    ResBodyT
  >(
    schemas: ResponseSchemas<ResStatusT, ResHeadersT, ResBodyT>,
    fetchResBody: any
  ): Promise<
    | ({ ok: true; res: ApiResponse<ResStatusT, ResHeadersT, ResBodyT> } & (
        | { hadSoftValidationError: false; invalidPart?: undefined; validationError?: undefined }
        | { hadSoftValidationError: true; invalidPart: keyof GenericApiResponse; validationError: string }
      ))
    | { ok: false; invalidPart: keyof GenericApiResponse; validationError: string }
  > => {
    const resStatus = (schemas.status ?? anyResStatusSchema).deserialize(fetchRes.status, { validation: validationMode });

    // We always do hard validation on statuses
    if (resStatus.error !== undefined) {
      return { ok: false, invalidPart: 'status', validationError: resStatus.error };
    }

    const [resHeaders, resBody] = await Promise.all([
      await (schemas.headers ?? anyResHeadersSchema).deserializeAsync(convertHeadersFromFetchResponse(fetchRes.headers), {
        validation: validationMode
      }),
      await (schemas.body ?? anyResBodySchema).deserializeAsync(fetchResBody, {
        validation: validationMode
      })
    ]);

    const res: ApiResponse<ResStatusT, ResHeadersT, ResBodyT> = {
      status: resStatus.deserialized as ResStatusT,
      headers: resHeaders.deserialized as ResHeadersT,
      body: resBody.deserialized as ResBodyT
    };

    if (validationMode !== 'none') {
      const checkedResponseValidation = checkResponseValidation({ resHeaders, resBody, validationMode: validationMode });
      if (!checkedResponseValidation.ok) {
        return checkedResponseValidation;
      } else if (checkedResponseValidation.hadSoftValidationError) {
        return {
          ok: true,
          res,
          hadSoftValidationError: true,
          invalidPart: checkedResponseValidation.invalidPart,
          validationError: checkedResponseValidation.validationError
        };
      }
    }

    return { ok: true, res, hadSoftValidationError: false };
  };

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const fetchResBody = await getBestResponseContentByType(responseType, fetchRes);

  const success = await checkFetchResponseContentAgainstSchema(api.schemas.successResponse, fetchResBody);
  if (success.ok && !success.hadSoftValidationError) {
    return { ok: true, ...success.res, fetchRes };
  }
  type Success = typeof success;

  // If not immediately successful (where the success response schema is satisfied with no validation errors), then we need to figure out
  // the best mapping.

  const successCase = (success: Success & { ok: true }): { ok: true; fetchRes: Response } & (typeof success)['res'] => {
    triggerOnResponseValidationErrorHandler({
      api: api as any as GenericHttpApi,
      req,
      res: success.res,
      fetchRes,
      invalidPart: success.invalidPart,
      validationError: success.validationError
    });

    return { ok: true, ...success.res, fetchRes };
  };

  const hardErrorCase = (success: Success): { ok: false; error: string; fetchRes: Response } => {
    triggerOnResponseValidationErrorHandler({
      api: api as any as GenericHttpApi,
      req,
      res: undefined,
      fetchRes,
      invalidPart: success.invalidPart,
      validationError: success.validationError
    });

    return { ok: false, error: `Response ${success.invalidPart} validation error: ${success.validationError}`, fetchRes };
  };

  const hasFailureResponseSchema = isFailureResponseSchemaSpecified(api.schemas.failureResponse);
  if (!hasFailureResponseSchema) {
    // If there's no failure response schema definition

    if (success.ok && success.hadSoftValidationError) {
      return successCase(success);
    } else {
      return hardErrorCase(success);
    }
  } else {
    const failure = await checkFetchResponseContentAgainstSchema(api.schemas.failureResponse!, fetchResBody);
    type Failure = typeof failure;

    const failureCase = (failure: Failure & { ok: true }): { ok: false; fetchRes: Response } & (typeof failure)['res'] => {
      if (failure.invalidPart !== undefined) {
        triggerOnResponseValidationErrorHandler({
          api: api as any as GenericHttpApi,
          req,
          res: failure.res,
          fetchRes,
          invalidPart: failure.invalidPart,
          validationError: failure.validationError
        });
      }

      return { ok: false, ...failure.res, fetchRes };
    };

    if (failure.ok) {
      if (!failure.hadSoftValidationError) {
        // If the success case had either hard or soft validation errors but the failure case was ok, then this is the failure case.
        // However, if the failure schema is undefined, in which case the failure case will be trivially ok, we don't want to assume the
        // failure case is correct.

        return failureCase(failure);
      } else if (success.ok) {
        // If the success case had a soft validation error and the failure case also had a soft validation error, but both were OK, assume
        // this is the success case

        return successCase(success);
      } else {
        // If the success case had a hard validation error and the failure case had a soft validation error, assume this is the failure case

        return failureCase(failure);
      }
    } else {
      // If both success and failure had hard validation errors, return the errors for the success case
      return hardErrorCase(success);
    }
  }
};
