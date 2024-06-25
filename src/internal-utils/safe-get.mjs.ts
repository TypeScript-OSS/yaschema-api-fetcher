import type { GetFieldType } from 'lodash';
import { get } from 'lodash-es';

export const safeGet = <TObject, TPath extends string>(
  value: TObject,
  field: TPath
): string extends TPath ? any : GetFieldType<TObject, TPath> => get(value, field);
