import type { AnyBody, HttpRequestType } from 'yaschema-api';

import type { EncodedRequestBody } from '../api-fetch/types/EncodedRequestBody';
import { makeFormData } from './make-form-data';

type RequestBodyEncoder = (body: AnyBody) => EncodedRequestBody;

const encodersByRequestType: Record<HttpRequestType, RequestBodyEncoder> = {
  'form-data': makeFormData,
  json: JSON.stringify
};

export const encodeBody = ({ requestType = 'json', body }: { requestType: HttpRequestType | undefined; body: AnyBody }) =>
  encodersByRequestType[requestType](body);
