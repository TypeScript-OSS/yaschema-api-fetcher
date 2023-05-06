import type { AnyBody, AnyHeaders, AnyParams, AnyQuery, AnyStatus, Api, ApiRequest, GenericApiRequest } from 'yaschema-api';

import type { ApiFetchResult, GenericApiFetchResult } from './ApiFetchResult';

/** Return `false` to not retry or an object describing when to retry */
export type ShouldRetryEvaluator<
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
> = (api: {
  api: Api;
  req: ApiRequest<ReqHeadersT, ReqParamsT, ReqQueryT, ReqBodyT>;
  res: ApiFetchResult<ResStatusT, ResHeadersT, ResBodyT, ErrResStatusT, ErrResHeadersT, ErrResBodyT> | undefined;
  retryCount: number;
}) => Promise<false | { afterDelayMSec: number; wasCanceled?: () => void }>;

export type GenericShouldRetryEvaluator = (api: {
  api: Api;
  req: GenericApiRequest;
  res: GenericApiFetchResult | undefined;
  retryCount: number;
}) => Promise<false | { afterDelayMSec: number; wasCanceled?: () => void }>;
