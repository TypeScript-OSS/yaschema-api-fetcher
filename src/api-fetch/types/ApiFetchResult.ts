import type { AnyBody, AnyHeaders, AnyStatus, ApiResponse, GenericApiResponse } from 'yaschema-api';

export type ApiFetchResult<
  ResStatusT extends AnyStatus,
  ResHeadersT extends AnyHeaders,
  ResBodyT extends AnyBody,
  ErrResStatusT extends AnyStatus,
  ErrResHeadersT extends AnyHeaders,
  ErrResBodyT extends AnyBody
> = (
  | ({ ok: true; error?: undefined } & ApiResponse<ResStatusT, ResHeadersT, ResBodyT>)
  | ({ ok: false; error?: undefined } & ApiResponse<ErrResStatusT, ErrResHeadersT, ErrResBodyT>)
  | { ok: false; error: string; status?: undefined; headers?: undefined; body?: undefined }
) & { fetchRes?: Response };

export type GenericApiFetchResult = (
  | ({ ok: true; error?: undefined } & GenericApiResponse)
  | ({ ok: false; error?: undefined } & GenericApiResponse)
  | { ok: false; error: string; status?: undefined; headers?: undefined; body?: undefined }
) & { fetchRes?: Response };
