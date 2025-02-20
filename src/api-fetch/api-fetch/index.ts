import { v4 as uuid } from 'uuid';
import type { ValidationMode } from 'yaschema';
import type {
  AnyBody,
  AnyHeaders,
  AnyParams,
  AnyQuery,
  AnyStatus,
  ApiRequest,
  ApiRoutingContext,
  GenericHttpApi,
  HttpApi
} from 'yaschema-api';

import { getFetch } from '../../config/fetch.js';
import { getOnDidReceiveResponseHandler } from '../../config/on-did-receive-response.js';
import { getOnDidRequestHandler } from '../../config/on-did-request.js';
import { getOnWillRequestHandler } from '../../config/on-will-request.js';
import { getDefaultShouldRetryEvaluator } from '../../config/retry.js';
import { getDefaultRequestValidationMode, getDefaultResponseValidationMode } from '../../config/validation-mode.js';
import { sleep } from '../../internal-utils/sleep.js';
import type { ApiFetchResult } from '../types/ApiFetchResult';
import { FetchRequirementsError } from '../types/FetchRequirementsError.js';
import type { GenericShouldRetryEvaluator, ShouldRetryEvaluator } from '../types/ShouldRetryEvaluator';
import { generateApiFetchResultFromFetchResponse } from './internal/generate-api-fetch-result-from-fetch-response.js';
import { generateFetchRequirementsFromApiFetchRequest } from './internal/generate-fetch-requirements-from-api-fetch-request.js';
import { isUnsupportedHttpResponseType } from './internal/is-unsupported-http-response-type.js';

export interface ApiFetchOptions<
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
> {
  /**
   * Override the configured request validation mode.
   *
   * @see `setDefaultRequestValidationMode`
   */
  requestValidationMode?: ValidationMode;
  /**
   * Override the configured response validation mode.
   *
   * Hard validation is always performed on responses statuses, regardless of this setting.
   *
   * @see `setDefaultResponseValidationMode`
   */
  responseValidationMode?: ValidationMode;
  /** Options that can be used to supplement / override those passed to `fetch` by default */
  fetchOptions?: RequestInit;
  shouldRetry?: ShouldRetryEvaluator<
    ReqHeadersT,
    ReqParamsT,
    ReqQueryT,
    ReqBodyT,
    ResStatusT,
    ResHeadersT,
    ResBodyT,
    ErrResStatusT,
    ErrResHeadersT,
    ErrResBodyT
  >;
}

/** Uses `fetch` to access the specified API */
export const apiFetch = async <
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
  {
    requestValidationMode = getDefaultRequestValidationMode(),
    responseValidationMode = getDefaultResponseValidationMode(),
    fetchOptions,
    shouldRetry,
    context
  }: ApiFetchOptions<
    ReqHeadersT,
    ReqParamsT,
    ReqQueryT,
    ReqBodyT,
    ResStatusT,
    ResHeadersT,
    ResBodyT,
    ErrResStatusT,
    ErrResHeadersT,
    ErrResBodyT
  > & { context?: ApiRoutingContext } = {}
): Promise<ApiFetchResult<ResStatusT, ResHeadersT, ResBodyT, ErrResStatusT, ErrResHeadersT, ErrResBodyT>> => {
  const responseType = api.responseType ?? 'json';
  if (responseType !== 'dynamic' && isUnsupportedHttpResponseType(responseType)) {
    throw new Error(`Unsupported HTTP response type (${responseType}) encountered for ${api.url}`);
  }

  const reqId = uuid();

  try {
    const { url, headers, body } = await generateFetchRequirementsFromApiFetchRequest(api, req, {
      validationMode: requestValidationMode,
      context
    });

    const fetch = getFetch();
    const combinedFetchOptions: RequestInit = {
      method: api.method,
      credentials: api.credentials,
      headers,
      body,
      ...fetchOptions
    };

    const shouldRetryEvaluator: GenericShouldRetryEvaluator | undefined =
      (shouldRetry as any as GenericShouldRetryEvaluator) ?? getDefaultShouldRetryEvaluator();

    let res: ApiFetchResult<ResStatusT, ResHeadersT, ResBodyT, ErrResStatusT, ErrResHeadersT, ErrResBodyT> | undefined;
    let willRetry = false;
    let retryCount = 0;
    let lastError = 'Unknown error';
    do {
      res = undefined;
      willRetry = false;

      getOnWillRequestHandler()({ api: api as any as GenericHttpApi, req, reqId, retryCount });

      let fetchRes: Response | undefined;
      try {
        const fetchPromise = fetch(url, combinedFetchOptions);

        getOnDidRequestHandler()({ api: api as any as GenericHttpApi, req, reqId, retryCount });

        fetchRes = await fetchPromise;

        getOnDidReceiveResponseHandler()({ api: api as any as GenericHttpApi, req, reqId, retryCount, res: fetchRes });
      } catch (e) {
        // Usually when the server is unreachable
        lastError = e instanceof Error ? e.message : lastError;
      }

      if (fetchRes !== undefined) {
        res = await generateApiFetchResultFromFetchResponse(api, req, { fetchRes, validationMode: responseValidationMode });
      }

      if (res === undefined || !res.ok) {
        const shouldRetryResult = (await shouldRetryEvaluator?.({ api: api as any as GenericHttpApi, req, res, retryCount })) ?? false;
        retryCount += 1;

        if (shouldRetryResult !== false) {
          await sleep(shouldRetryResult.afterDelayMSec);
          if (!(shouldRetryResult.wasCanceled?.() ?? false)) {
            willRetry = true;
          }
        }
      }
    } while (willRetry);

    return res ?? { ok: false, error: lastError };
  } catch (e) {
    if (e instanceof FetchRequirementsError) {
      return { ok: false, error: e.message };
    } else {
      throw e;
    }
  }
};
