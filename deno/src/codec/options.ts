import { DecimalDefinition } from "https://deno.land/x/parse_decimal@1.0.2/mod.ts";
import { BsonSerializableValue } from "../constants.ts";

export type ConvertArray<Type extends unknown[] = unknown[]> = (
  value: unknown[],
) => Type;
export type ConvertBinary<Type = unknown> = (value: Uint8Array) => Type;
export type ConvertBoolean<Type = unknown> = (value: boolean) => Type;
export type ConvertCode<Type = unknown> = (code: string) => Type;
export type ConvertCodeWithScope<Type = unknown> = (
  codeWithScope: [code: string, scope: Record<string, unknown>],
) => Type;
export type ConvertDbPointer<Type = unknown> = (
  dbPointer: [reference: string, objectId: Uint8Array],
) => Type;
export type ConvertDecimal128<Decimal128Type = unknown> = (
  value: DecimalDefinition,
) => Decimal128Type;
export type ConvertDouble<Type = unknown> = (value: number) => Type;
export type ConvertInt32<Int32Type = unknown> = (value: number) => Int32Type;
export type ConvertInt64<Int64Type = unknown> = (value: bigint) => Int64Type;
export type ConvertMaxKey<Type = unknown> = () => Type;
export type ConvertMinKey<Type = unknown> = () => Type;
export type ConvertNull<Type = unknown> = () => Type;
export type ConvertObject<
  Type extends Record<string, unknown> = Record<string, unknown>,
> = (value: Record<string, unknown>) => Type;
export type ConvertObjectId<Type = unknown> = (value: Uint8Array) => Type;
export type ConvertRegularExpression<Type = unknown> = (
  sourceAndFlags: [source: string, flags: string],
) => Type;
export type ConvertString<Type = unknown> = (value: string) => Type;
export type ConvertSymbol<Type = unknown> = (value: string) => Type;
export type ConvertTimestamp<Type = unknown> = (value: bigint) => Type;
export type ConvertUndefined<Type = unknown> = () => Type;
export type ConvertUtcDatetime<Type = unknown> = (value: bigint) => Type;

export type DeserializeDeprecatedAction = "deserialize" | "ignore" | "error";
export type SerializeDeprecatedAction = "serialize" | "skip" | "error";

export type DeserializeOptions = {
  converters?: {
    convertArray?: ConvertArray;
    convertBinary?: ConvertBinary;
    convertBoolean?: ConvertBoolean;
    convertCode?: ConvertCode;
    convertCodeWithScope?: ConvertCodeWithScope;
    convertDbPointer?: ConvertDbPointer;
    convertDecimal128?: ConvertDecimal128;
    convertDouble?: ConvertDouble;
    convertInt32?: ConvertInt32;
    convertInt64?: ConvertInt64;
    convertMaxKey?: ConvertMaxKey;
    convertMinKey?: ConvertMinKey;
    convertNull?: ConvertNull;
    convertObject?: ConvertObject;
    convertObjectId?: ConvertObjectId;
    convertRegularExpression?: ConvertRegularExpression;
    convertString?: ConvertString;
    convertSymbol?: ConvertSymbol;
    convertTimestamp?: ConvertTimestamp;
    convertUndefined?: ConvertUndefined;
    convertUtcDatetime?: ConvertUtcDatetime;
  };
  deprecated?: {
    undefined?: DeserializeDeprecatedAction;
    dbPointer?: DeserializeDeprecatedAction | "convert-to-db-ref";
    symbol?: DeserializeDeprecatedAction;
    codeWithScope?: DeserializeDeprecatedAction;
  };
};

export type SerializeOptions = {
  convertValue?: (
    value: unknown,
    autoConvert: (value: unknown) => BsonSerializableValue | undefined,
  ) => BsonSerializableValue | undefined;
  deprecated?: {
    undefined?: SerializeDeprecatedAction | "convert-to-null";
    dbPointer?: SerializeDeprecatedAction | "convert-to-db-ref";
    symbol?: SerializeDeprecatedAction;
    codeWithScope?: SerializeDeprecatedAction;
  };
};
