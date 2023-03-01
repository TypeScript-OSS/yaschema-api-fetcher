import type { AnyBody, AnyHeaders, AnyStatus, ApiResponse } from 'yaschema-api';

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
