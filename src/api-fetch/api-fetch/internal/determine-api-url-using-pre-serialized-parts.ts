import type { AnyBody, AnyHeaders, AnyParams, AnyQuery, AnyStatus, HttpApi } from 'yaschema-api';
import { getUrlBaseForRouteType } from 'yaschema-api';

import { makeQueryString } from '../../../internal-utils/make-query-string.js';
import { populateParamMarkersInUrl } from '../../../internal-utils/populate-param-markers-in-url.js';
import { safeGet } from '../../../internal-utils/safe-get.js';
import { FetchRequirementsError } from '../../types/FetchRequirementsError.js';

export const determineApiUrlUsingPreSerializedParts = <
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
  req: { params: AnyParams; query: AnyQuery }
): URL => {
  const queryString = makeQueryString(req.query);
  let paramPopulatedUrl: string;
  try {
    paramPopulatedUrl = populateParamMarkersInUrl(api.url, req.params);
  } catch (e) {
    throw new FetchRequirementsError(safeGet(e, 'message') ?? '');
  }
  const constructedUrl = `${paramPopulatedUrl}${queryString.length > 0 ? '?' : ''}${queryString}`;

  const urlBase = getUrlBaseForRouteType(api.routeType);
  const url = new URL(constructedUrl, urlBase.length === 0 ? undefined : urlBase);

  return url;
};
