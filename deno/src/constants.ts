import { BinarySequence } from "./utils/binary-sequence.ts";

export const TYPE_DOUBLE = 0x01;
export const TYPE_STRING = 0x02;
export const TYPE_EMBEDDED_OBJECT = 0x03;
export const TYPE_EMBEDDED_ARRAY = 0x04;
export const TYPE_BINARY_DATA = 0x05;
export const TYPE_UNDEFINED = 0x06;
export const TYPE_OBJECT_ID = 0x07;
export const TYPE_BOOLEAN = 0x08;
export const TYPE_UTC_DATETIME = 0x09;
export const TYPE_NULL = 0x0A;
export const TYPE_REGULAR_EXPRESSION = 0x0B;
export const TYPE_DB_POINTER = 0x0C;
export const TYPE_CODE = 0x0D;
export const TYPE_SYMBOL = 0x0E;
export const TYPE_CODE_WITH_SCOPE = 0x0F;
export const TYPE_INT32 = 0x10;
export const TYPE_TIMESTAMP = 0x11;
export const TYPE_INT64 = 0x12;
export const TYPE_DECIMAL128 = 0x13;
export const TYPE_MIN_KEY = 0xFF;
export const TYPE_MAX_KEY = 0x7F;

export const VALUE_BOOLEAN_FALSE = 0x00;
export const VALUE_BOOLEAN_TRUE = 0x01;

export const BINARY_SUBTYPE_GENERIC = 0x00 as const;
export const BINARY_SUBTYPE_FUNCTION = 0x01 as const;
export const BINARY_SUBTYPE_BINARY_OLD = 0x02 as const;
export const BINARY_SUBTYPE_UUID_OLD = 0x03 as const;
export const BINARY_SUBTYPE_UUID = 0x04 as const;
export const BINARY_SUBTYPE_MD5 = 0x05 as const;
export const BINARY_SUBTYPE_ENCRYPTED_BSON = 0x06 as const;
export const BINARY_SUBTYPE_COMPRESSED_BSON = 0x07 as const;

export const BINARY_SUBTYPE_USER_DEFINED_START = 0x80 as const;
export const BINARY_SUBTYPE_USER_DEFINED_END = 0xFF as const;

export type BsonBinarySubtype =
  | typeof BINARY_SUBTYPE_GENERIC
  | typeof BINARY_SUBTYPE_FUNCTION
  | typeof BINARY_SUBTYPE_BINARY_OLD
  | typeof BINARY_SUBTYPE_UUID_OLD
  | typeof BINARY_SUBTYPE_UUID
  | typeof BINARY_SUBTYPE_MD5
  | typeof BINARY_SUBTYPE_ENCRYPTED_BSON
  | typeof BINARY_SUBTYPE_COMPRESSED_BSON
  | BsonBinarySubtypeUserDefined;

/* deno-fmt-ignore */
export type BsonBinarySubtypeUserDefined =
  | 0x80 | 0x81 | 0x82 | 0x83 | 0x84 | 0x85 | 0x86 | 0x87 | 0x88 | 0x89 | 0x8A | 0x8B | 0x8C | 0x8D | 0x8E | 0x8F
  | 0x90 | 0x91 | 0x92 | 0x93 | 0x94 | 0x95 | 0x96 | 0x97 | 0x98 | 0x99 | 0x9A | 0x9B | 0x9C | 0x9D | 0x9E | 0x9F
  | 0xA0 | 0xA1 | 0xA2 | 0xA3 | 0xA4 | 0xA5 | 0xA6 | 0xA7 | 0xA8 | 0xA9 | 0xAA | 0xAB | 0xAC | 0xAD | 0xAE | 0xAF
  | 0xB0 | 0xB1 | 0xB2 | 0xB3 | 0xB4 | 0xB5 | 0xB6 | 0xB7 | 0xB8 | 0xB9 | 0xBA | 0xBB | 0xBC | 0xBD | 0xBE | 0xBF
  | 0xC0 | 0xC1 | 0xC2 | 0xC3 | 0xC4 | 0xC5 | 0xC6 | 0xC7 | 0xC8 | 0xC9 | 0xCA | 0xCB | 0xCC | 0xCD | 0xCE | 0xCF
  | 0xD0 | 0xD1 | 0xD2 | 0xD3 | 0xD4 | 0xD5 | 0xD6 | 0xD7 | 0xD8 | 0xD9 | 0xDA | 0xDB | 0xDC | 0xDD | 0xDE | 0xDF
  | 0xE0 | 0xE1 | 0xE2 | 0xE3 | 0xE4 | 0xE5 | 0xE6 | 0xE7 | 0xE8 | 0xE9 | 0xEA | 0xEB | 0xEC | 0xED | 0xEE | 0xEF
  | 0xF0 | 0xF1 | 0xF2 | 0xF3 | 0xF4 | 0xF5 | 0xF6 | 0xF7 | 0xF8 | 0xF9 | 0xFA | 0xFB | 0xFC | 0xFD | 0xFE | 0xFF;

export type BsonSerializableValue =
  | BsonSerializableArray
  | BsonSerializableBinary
  | BsonSerializableBoolean
  | BsonSerializableCode
  | BsonSerializableCodeWithScope
  | BsonSerializableDbPointer
  | BsonSerializableDecimal128
  | BsonSerializableDouble
  | BsonSerializableInt32
  | BsonSerializableInt64
  | BsonSerializableMaxKey
  | BsonSerializableMinKey
  | BsonSerializableNull
  | BsonSerializableObject
  | BsonSerializableObjectId
  | BsonSerializableRegularExpression
  | BsonSerializableString
  | BsonSerializableSymbol
  | BsonSerializableTimestamp
  | BsonSerializableUndefined
  | BsonSerializableUtcDatetime;

export type BsonDocument = BsonObject | BsonArray;
export type BsonObject =
  | Readonly<Record<string, unknown>>
  | Map<string, unknown>;
export type BsonArray = ReadonlyArray<unknown>;

export type BsonSerializableArray = readonly ["array", BsonArray];
export type BsonSerializableBinary = readonly [
  "binary",
  BsonBinarySubtype,
  BinarySequence,
];
export type BsonSerializableBoolean = readonly ["boolean", boolean];
export type BsonSerializableCode = readonly ["code", string];
export type BsonSerializableCodeWithScope = readonly [
  "code-with-scope",
  string,
  BsonObject,
];
export type BsonSerializableDbPointer = readonly [
  "db-pointer",
  string,
  BinarySequence,
];
export type BsonSerializableDecimal128 = readonly [
  "decimal128",
  number | bigint | BinarySequence,
];
export type BsonSerializableDouble = readonly [
  "double",
  number | bigint | BinarySequence,
];
export type BsonSerializableInt32 = readonly [
  "int32",
  number | bigint | BinarySequence,
];
export type BsonSerializableInt64 = readonly [
  "int64",
  number | bigint | BinarySequence,
];
export type BsonSerializableMaxKey = readonly ["max-key"];
export type BsonSerializableMinKey = readonly ["min-key"];
export type BsonSerializableNull = readonly ["null"];
export type BsonSerializableObject = readonly ["object", BsonObject];
export type BsonSerializableObjectId = readonly ["object-id", BinarySequence];
export type BsonSerializableRegularExpression =
  | readonly [type: "regular-expression", regularExpression: RegExp]
  | readonly [type: "regular-expression", pattern: string, flags: string];
export type BsonSerializableString = readonly ["string", string];
export type BsonSerializableSymbol = readonly ["symbol", string];
export type BsonSerializableTimestamp = readonly [
  "timestamp",
  number | bigint | BinarySequence,
];
export type BsonSerializableUndefined = readonly ["undefined"];
export type BsonSerializableUtcDatetime = readonly [
  "utc-datetime",
  number | bigint | BinarySequence,
];

export const TO_BSON_SERIALIZABLE_VALUE = Symbol("toBson");

export interface BsonSerializableValueProvider {
  [TO_BSON_SERIALIZABLE_VALUE]: () => BsonSerializableValue | undefined;
}
