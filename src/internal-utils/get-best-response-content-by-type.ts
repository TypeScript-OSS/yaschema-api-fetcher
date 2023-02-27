import type { SupportedHttpResponseType } from '../api-fetch/api-fetch/is-unsupported-http-response-type';

/**
 * Uses the response type to determine how to get values from `fetch`.
 *
 * For example, if `responseType` is `"json"`, this returns `res.json()`.
 *
 * When `responseType` is `"dynamic"`, the `"content-type"` response header is used.  This supports `"application/json"` and `"text/plain"`.
 * For all other content types, `res.body` is returned.
 */
export const getBestResponseContentByType = async (responseType: SupportedHttpResponseType | 'dynamic', res: Response) => {
  switch (responseType) {
    case 'json':
      return res.json();
    case 'text':
      return res.text();
    case 'blob':
      return res.blob();
    case 'arraybuffer':
      return res.arrayBuffer();
    case 'stream':
      return res.body;
    case 'dynamic': {
      const contentType = res.headers.get('content-type') ?? '';
      if (contentType.includes('application/json')) {
        return res.json();
      } else if (contentType.includes('text/plain')) {
        return res.text();
      } else {
        return res.body;
      }
    }
  }
};
