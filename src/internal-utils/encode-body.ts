import type { AnyBody, HttpRequestType } from 'yaschema-api';

import type { EncodedRequestBody } from '../api-fetch/types/EncodedRequestBody';
import { makeFormData } from './make-form-data.js';

type RequestBodyEncoder = (body: AnyBody) => EncodedRequestBody;

const encodersByRequestType: Record<HttpRequestType, RequestBodyEncoder> = {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  binary: (value: any) => value,
  'form-data': makeFormData,
  json: JSON.stringify
};

export const encodeBody = ({ requestType = 'json', body }: { requestType: HttpRequestType | undefined; body: AnyBody }) =>
  encodersByRequestType[requestType](body);
