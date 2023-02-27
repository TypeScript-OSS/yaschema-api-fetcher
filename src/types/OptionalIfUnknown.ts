export type OptionalIfUnknown<K extends string | number | symbol, T> = [T] extends [unknown] ? Partial<Record<K, T>> : Record<K, T>;
