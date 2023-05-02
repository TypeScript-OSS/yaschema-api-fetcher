const getTypeOf = (value: any) => typeof value;
export type TypeOf = ReturnType<typeof getTypeOf>;

const isPrimitiveByType: Record<TypeOf, boolean> = {
  bigint: true,
  boolean: true,
  function: false,
  number: true,
  object: false,
  string: true,
  symbol: true,
  undefined: true
};

export const primitivesTypes = new Set<TypeOf>((Object.keys(isPrimitiveByType) as TypeOf[]).filter((key) => isPrimitiveByType[key]));
