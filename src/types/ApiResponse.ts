import type { AnyStringSerializableType } from 'yaschema-api';

export interface ApiResponse<StatusT extends number, HeadersT extends Record<string, AnyStringSerializableType>, BodyT> {
  status: StatusT;
  headers: HeadersT;
  body: BodyT;
}
