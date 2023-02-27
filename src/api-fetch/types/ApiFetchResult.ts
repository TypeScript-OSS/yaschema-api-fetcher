import type { AnyStringSerializableType } from 'yaschema-api';

import type { ApiResponse } from '../../types/ApiResponse';

export type ApiFetchResult<
  ResStatusT extends number,
  ResHeadersT extends Record<string, AnyStringSerializableType>,
  ResBodyT,
  ErrResStatusT extends number,
  ErrResHeadersT extends Record<string, AnyStringSerializableType>,
  ErrResBodyT
> = (
  | ({ ok: true; error?: undefined } & ApiResponse<ResStatusT, ResHeadersT, ResBodyT>)
  | ({ ok: false; error?: undefined } & ApiResponse<ErrResStatusT, ErrResHeadersT, ErrResBodyT>)
  | { ok: false; error: string; status?: undefined; headers?: undefined; body?: undefined }
) & { fetchRes?: Response };
