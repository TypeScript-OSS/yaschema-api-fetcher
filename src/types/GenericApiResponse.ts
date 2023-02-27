import type { AnyStringSerializableType } from 'yaschema-api';

import type { ApiResponse } from './ApiResponse';

export type GenericApiResponse = ApiResponse<number, Record<string, AnyStringSerializableType>, any>;
