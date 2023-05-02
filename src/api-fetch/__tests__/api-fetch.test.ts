import nodeFetch, { FormData } from 'node-fetch';
import { schema } from 'yaschema';
import { makeHttpApi } from 'yaschema-api';

import type { Fetch } from '../../config/fetch';
import { setFetch } from '../../config/fetch';
import { setFormDataConstructor } from '../../config/form-data';
import { apiFetch } from '../api-fetch';

describe('apiFetch', () => {
  beforeAll(() => {
    setFetch(nodeFetch as any as Fetch);
    setFormDataConstructor(FormData);
  });

  it('GET should work', async () => {
    const exampleApi = makeHttpApi({
      method: 'GET',
      routeType: 'testing',
      url: 'https://raw.githubusercontent.com/bahamas10/css-color-names/master/css-color-names.json',
      cachePolicy: { canCache: 'public', cacheIntervalSec: 60 },
      isSafeToRetry: true,
      schemas: {
        request: {},
        successResponse: {
          body: schema.record(schema.string(), schema.string())
        }
      }
    });

    const res = await apiFetch(exampleApi, {});
    expect(res.ok).toBeTruthy();
    if (!res.ok) {
      return;
    }

    expect(res.body?.black).toBe('#000000');
  });

  it('validation should work', async () => {
    const exampleApi = makeHttpApi({
      method: 'GET',
      routeType: 'testing',
      url: 'https://raw.githubusercontent.com/bahamas10/css-color-names/master/css-color-names.json',
      cachePolicy: { canCache: 'public', cacheIntervalSec: 60 },
      isSafeToRetry: true,
      schemas: {
        request: {},
        successResponse: {
          // Should cause a validation error since this is really Record<string, string>
          body: schema.record(schema.string(), schema.number())
        }
      }
    });

    const res = await apiFetch(exampleApi, {});
    expect(res.ok).toBeFalsy();
    if (res.ok) {
      return;
    }

    expect(res.error).toBeDefined();
  });

  it('retries should work', async () => {
    const exampleApi = makeHttpApi({
      method: 'GET',
      routeType: 'testing',
      url: 'https://raw.githubusercontent.com/bahamas10/css-color-names/master/css-color-names.json',
      cachePolicy: { canCache: 'public', cacheIntervalSec: 60 },
      isSafeToRetry: true,
      schemas: {
        request: {},
        successResponse: {
          // Should cause a validation error since this is really Record<string, string>
          body: schema.record(schema.string(), schema.number())
        }
      }
    });

    let numShouldRetryChecks = 0;
    const res = await apiFetch(
      exampleApi,
      {},
      {
        shouldRetry: async ({ api, retryCount }) => {
          numShouldRetryChecks += 1;
          return api.isSafeToRetry && retryCount < 2 ? { afterDelayMSec: 100 } : false;
        }
      }
    );
    expect(res.ok).toBeFalsy();
    expect(numShouldRetryChecks).toBe(3);
    if (res.ok) {
      return;
    }

    expect(res.error).toBeDefined();
  });
});
