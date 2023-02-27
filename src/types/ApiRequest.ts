import type { SingleOrArray } from 'yaschema';
import type { AnyStringSerializableType } from 'yaschema-api';

import type { OptionalIfUnknown } from './OptionalIfUnknown';

export type ApiRequest<
  HeadersT extends Record<string, AnyStringSerializableType>,
  ParamsT extends Record<string, AnyStringSerializableType>,
  QueryT extends Record<string, SingleOrArray<AnyStringSerializableType>>,
  BodyT
> = OptionalIfUnknown<'headers', HeadersT> &
  OptionalIfUnknown<'params', ParamsT> &
  OptionalIfUnknown<'query', QueryT> &
  OptionalIfUnknown<'body', BodyT>;
