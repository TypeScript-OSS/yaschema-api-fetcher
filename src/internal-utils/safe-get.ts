import type { GetFieldType } from 'lodash';
import _ from 'lodash';

export const safeGet = <TObject, TPath extends string>(
  value: TObject,
  field: TPath
): string extends TPath ? any : GetFieldType<TObject, TPath> => _.get(value, field);
