import type { AnyHeaders, HttpRequestType } from 'yaschema-api';

const defaultContentTypeByRequestType: Record<HttpRequestType, string> = {
  'form-data': 'multipart/form-data',
  json: 'application/json'
};

/** Converts headers from the format expected by yaschema-api to the format expected by `fetch` */
export const convertHeadersForFetchRequest = ({
  requestType = 'json',
  headers
}: {
  requestType: HttpRequestType | undefined;
  headers: AnyHeaders;
}) => {
  const output = Object.entries(headers ?? {}).reduce((out: Record<string, string>, [key, value]) => {
    if (value === null || value === undefined) {
      return out; // Skipping
    }

    out[key.toLowerCase()] = String(value);
    return out;
  }, {});

  output['content-type'] = output['content-type'] ?? defaultContentTypeByRequestType[requestType];

  return output;
};
