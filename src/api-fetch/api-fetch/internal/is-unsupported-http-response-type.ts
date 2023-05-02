import type { HttpResponseType } from 'yaschema-api';

type UnsupportedHttpResponseType = 'document';
const unsupportedHttpResponseTypes = new Set<HttpResponseType>(['document']);

export type SupportedHttpResponseType = Exclude<HttpResponseType, UnsupportedHttpResponseType>;

export const isUnsupportedHttpResponseType = (responseType: HttpResponseType): responseType is UnsupportedHttpResponseType =>
  unsupportedHttpResponseTypes.has(responseType);
