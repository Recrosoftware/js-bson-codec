import {BinarySequence} from './utils/binary-sequence.ts';


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

export type BsonType =
  typeof TYPE_DOUBLE
  | typeof TYPE_STRING
  | typeof TYPE_EMBEDDED_OBJECT
  | typeof TYPE_EMBEDDED_ARRAY
  | typeof TYPE_BINARY_DATA
  | typeof TYPE_UNDEFINED
  | typeof TYPE_OBJECT_ID
  | typeof TYPE_BOOLEAN
  | typeof TYPE_UTC_DATETIME
  | typeof TYPE_NULL
  | typeof TYPE_REGULAR_EXPRESSION
  | typeof TYPE_DB_POINTER
  | typeof TYPE_CODE
  | typeof TYPE_SYMBOL
  | typeof TYPE_CODE_WITH_SCOPE
  | typeof TYPE_INT32
  | typeof TYPE_TIMESTAMP
  | typeof TYPE_INT64
  | typeof TYPE_DECIMAL128
  | typeof TYPE_MIN_KEY
  | typeof TYPE_MAX_KEY

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
export const BINARY_SUBTYPE_USER_DEFINED = 0x80 as const;

export type BsonBinarySubtype =
  typeof BINARY_SUBTYPE_GENERIC
  | typeof BINARY_SUBTYPE_FUNCTION
  | typeof BINARY_SUBTYPE_BINARY_OLD
  | typeof BINARY_SUBTYPE_UUID_OLD
  | typeof BINARY_SUBTYPE_UUID
  | typeof BINARY_SUBTYPE_MD5
  | typeof BINARY_SUBTYPE_ENCRYPTED_BSON
  | typeof BINARY_SUBTYPE_COMPRESSED_BSON
  | typeof BINARY_SUBTYPE_USER_DEFINED;


export type BsonSerializableValue =
  BsonSerializableArray
  | BsonSerializableBinary
  | BsonSerializableBoolean
  | BsonSerializableCode
  | BsonSerializableCodeWithScope
  // typeof TYPE_DB_POINTER
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
  | BsonSerializableUtcDatetime

export type BsonDocument = BsonObject | BsonArray;
export type BsonObject = Readonly<Record<string, unknown>> | Map<string, unknown>;
export type BsonArray = ReadonlyArray<unknown>;

export type BsonSerializableArray = readonly ['array', BsonArray];
export type BsonSerializableBinary = readonly ['binary', BsonBinarySubtype, BinarySequence];
export type BsonSerializableBoolean = readonly ['boolean', boolean];
export type BsonSerializableCode = readonly ['code', string];
export type BsonSerializableCodeWithScope = readonly ['code-with-scope', string, BsonObject];
export type BsonSerializableDecimal128 = readonly ['decimal128', number | bigint | BinarySequence];
export type BsonSerializableDouble = readonly ['double', number | bigint | BinarySequence];
export type BsonSerializableInt32 = readonly ['int32', number | bigint | BinarySequence];
export type BsonSerializableInt64 = readonly ['int64', number | bigint | BinarySequence];
export type BsonSerializableMaxKey = readonly ['max-key'];
export type BsonSerializableMinKey = readonly ['min-key'];
export type BsonSerializableNull = readonly ['null'];
export type BsonSerializableObject = readonly ['object', BsonObject];
export type BsonSerializableObjectId = readonly ['object-id', BinarySequence];
export type BsonSerializableRegularExpression =
  readonly ['reg-exp', RegExp]
  | readonly  [type: 'reg-exp', pattern: string, flags: string];
export type BsonSerializableString = readonly ['string', string];
export type BsonSerializableSymbol = readonly ['symbol', string];
export type BsonSerializableTimestamp = readonly ['timestamp', number | bigint | BinarySequence];
export type BsonSerializableUndefined = readonly ['undefined'];
export type BsonSerializableUtcDatetime = readonly ['utc-datetime', number | bigint | BinarySequence];


export const BSON_TYPE_SYMBOL = Symbol('BSON_TYPE');

export const TO_BSON_SERIALIZABLE_VALUE = Symbol('toBson');

export const EJSON_DESERIALIZER = Symbol('EJSON Deserializer');
export const EJSON_SERIALIZER = Symbol('EJSON Serializer');
