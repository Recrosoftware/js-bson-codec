import {
  BINARY_SUBTYPE_BINARY_OLD,
  BINARY_SUBTYPE_COMPRESSED_BSON,
  BINARY_SUBTYPE_ENCRYPTED_BSON,
  BINARY_SUBTYPE_FUNCTION,
  BINARY_SUBTYPE_GENERIC,
  BINARY_SUBTYPE_MD5,
  BINARY_SUBTYPE_USER_DEFINED,
  BINARY_SUBTYPE_UUID,
  BINARY_SUBTYPE_UUID_OLD,
  BsonArray,
  BsonBinarySubtype,
  BsonDocument,
  BsonObject,
  BsonSerializableArray,
  BsonSerializableBinary,
  BsonSerializableBoolean,
  BsonSerializableCode,
  BsonSerializableCodeWithScope,
  BsonSerializableDecimal128,
  BsonSerializableDouble,
  BsonSerializableInt32,
  BsonSerializableInt64,
  BsonSerializableMaxKey,
  BsonSerializableMinKey,
  BsonSerializableNull,
  BsonSerializableObject,
  BsonSerializableObjectId,
  BsonSerializableRegularExpression,
  BsonSerializableString,
  BsonSerializableSymbol,
  BsonSerializableTimestamp,
  BsonSerializableUtcDatetime,
  BsonSerializableValue
} from '../constants.ts';
import {getLength, isBinarySequence} from './binary-sequence.ts';
import {isStringDecimal, isStringInteger} from './numbers.ts';


const REGEXP_ALLOWED_FLAGS = 'imxlsu';
const REGEXP_FLAGS_MAX = REGEXP_ALLOWED_FLAGS.length;
const REGEXP_FLAGS_CHECK = new RegExp(`/[^${REGEXP_ALLOWED_FLAGS}]/`);

function canBeABsonSerializableValue(input: unknown, type?: BsonSerializableValue[0]): input is BsonSerializableValue {
  return Array.isArray(input) && typeof input[0] === 'string' && (type == null || input[0] === type);
}

function isSerializableNumericType(input: Partial<BsonSerializableValue>): boolean {
  return input.length == 2 && (
    typeof input[1] === 'string'
    || typeof input[1] === 'number'
    || typeof input[1] === 'bigint'
    || isBinarySequence(input[1])
  );
}

export function isBsonBinarySubType(input: unknown): input is BsonBinarySubtype {
  switch (input) {
    case BINARY_SUBTYPE_GENERIC:
    case BINARY_SUBTYPE_FUNCTION:
    case BINARY_SUBTYPE_BINARY_OLD:
    case BINARY_SUBTYPE_UUID_OLD:
    case BINARY_SUBTYPE_UUID:
    case BINARY_SUBTYPE_MD5:
    case BINARY_SUBTYPE_ENCRYPTED_BSON:
    case BINARY_SUBTYPE_COMPRESSED_BSON:
    case BINARY_SUBTYPE_USER_DEFINED:
      return true;
    default:
      return false;
  }
}

export function isValidInt32(value: string | number | bigint): boolean {
  if (typeof value === 'string') {
    if (!isStringInteger(value)) return false;

    return false; // TODO: Check range
  }
  if (typeof value !== 'number' && typeof value !== 'bigint') return false;

  // TODO
  /**
   *   if (typeof number === 'string') return isStringInteger(number); // TODO: check string ranges
   *   if (typeof number === 'bigint') return number >= -(2n ** 31n) && number < (2n ** 31n);
   *   return Number.isInteger(number) && number >= -(2 ** 31) && number <= (2 ** 31);
   */
  return false;
}

export function isValidInt64(value: string | number | bigint): boolean {
  if (typeof value === 'string') {
    if (!isStringInteger(value)) return false;

    return false; // TODO: Check range
  }
  if (typeof value !== 'number' && typeof value !== 'bigint') return false;

  // TODO

  /**
   *   if (typeof number === 'string') return isStringInteger(number); // TODO: check string ranges
   *   if (typeof number === 'bigint') return number >= -(2n ** 63n) && number < (2n ** 63n);
   *   return Number.isInteger(number);
   */
  return false;
}

export function isValidUInt64(value: string | number | bigint): boolean {
  if (typeof value === 'string') {
    if (!isStringInteger(value)) return false;

    return false; // TODO: Check range
  }
  if (typeof value !== 'number' && typeof value !== 'bigint') return false;

  // TODO

  /**
   *   if (typeof number === 'string') return isStringInteger(number); // TODO: check string ranges
   *   if (typeof number === 'bigint') return number >= 0n && number < (2n ** 64n);
   *   return Number.isInteger(number) && number >= 0;
   */
  return false;
}

export function isValidDecimal64(value: string | number | bigint): boolean {
  if (typeof value === 'string') {
    if (!isStringDecimal(value)) return false;

    return false; // TODO: Check range
  }
  if (typeof value !== 'number' && typeof value !== 'bigint') return false;

  // TODO
  // if (typeof number === 'string') return isStringDecimal(number); // TODO: check string ranges
  return false;
}

export function isValidDecimal128(value: string | number | bigint): boolean {
  if (typeof value === 'string') {
    if (!isStringDecimal(value)) return false;

    return false; // TODO: Check range
  }
  if (typeof value !== 'number' && typeof value !== 'bigint') return false;

  // TODO

  /**
   *   if (typeof number === 'string') return isStringDecimal(number); // TODO: check string ranges
   *   if (typeof number === 'bigint') return number >= -(2n ** 127n) && number < (2n ** 127n);
   *   return true;
   */
  return false;
}

export function isBsonDocument(input: unknown): input is BsonDocument {
  return isBsonArray(input) || isBsonObject(input);
}

export function isBsonObject(input: unknown): input is BsonObject {
  if (typeof input !== 'object') return false;

  return input != null && !isBsonArray(input);
}

export function isBsonArray(input: unknown): input is BsonArray {
  return Array.isArray(input);
}

export function isBsonSerializableValue(input: unknown): input is Partial<BsonSerializableValue> {
  if (!canBeABsonSerializableValue(input)) return false;

  return isBsonSerializableDouble(input)
    || isBsonSerializableString(input)
    || isBsonSerializableObject(input)
    || isBsonSerializableArray(input)
    || isBsonSerializableBinary(input)
    || isBsonSerializableObjectId(input)
    || isBsonSerializableBoolean(input)
    || isBsonSerializableUtcDatetime(input)
    || isBsonSerializableNull(input)
    || isBsonSerializableRegularExpression(input)
    || isBsonSerializableCode(input)
    || isBsonSerializableSymbol(input)
    || isBsonSerializableCodeWithScope(input)
    || isBsonSerializableInt32(input)
    || isBsonSerializableTimestamp(input)
    || isBsonSerializableInt64(input)
    || isBsonSerializableDecimal128(input)
    || isBsonSerializableMinKey(input)
    || isBsonSerializableMaxKey(input);
}

export function isBsonSerializableDouble(input: unknown): input is Partial<BsonSerializableDouble> {
  return canBeABsonSerializableValue(input, 'double');
}

export function isBsonSerializableString(input: unknown): input is Partial<BsonSerializableString> {
  return canBeABsonSerializableValue(input, 'string');
}

export function isBsonSerializableObject(input: unknown): input is Partial<BsonSerializableObject> {
  return canBeABsonSerializableValue(input, 'object');
}

export function isBsonSerializableArray(input: unknown): input is Partial<BsonSerializableArray> {
  return canBeABsonSerializableValue(input, 'array');
}

export function isBsonSerializableBinary(input: unknown): input is Partial<BsonSerializableBinary> {
  return canBeABsonSerializableValue(input, 'binary');
}

export function isBsonSerializableObjectId(input: unknown): input is Partial<BsonSerializableObjectId> {
  return canBeABsonSerializableValue(input, 'object-id');
}

export function isBsonSerializableBoolean(input: unknown): input is Partial<BsonSerializableBoolean> {
  return canBeABsonSerializableValue(input, 'boolean');
}

export function isBsonSerializableUtcDatetime(input: unknown): input is Partial<BsonSerializableUtcDatetime> {
  return canBeABsonSerializableValue(input, 'utc-datetime');
}

export function isBsonSerializableNull(input: unknown): input is Partial<BsonSerializableNull> {
  return canBeABsonSerializableValue(input, 'null');
}

export function isBsonSerializableRegularExpression(input: unknown): input is Partial<BsonSerializableRegularExpression> {
  return canBeABsonSerializableValue(input, 'reg-exp');
}

export function isBsonSerializableCode(input: unknown): input is Partial<BsonSerializableCode> {
  return canBeABsonSerializableValue(input, 'code');
}

export function isBsonSerializableSymbol(input: unknown): input is Partial<BsonSerializableSymbol> {
  return canBeABsonSerializableValue(input, 'symbol');
}

export function isBsonSerializableCodeWithScope(input: unknown): input is Partial<BsonSerializableCodeWithScope> {
  return canBeABsonSerializableValue(input, 'code-with-scope');
}

export function isBsonSerializableInt32(input: unknown): input is Partial<BsonSerializableInt32> {
  return canBeABsonSerializableValue(input, 'int32');
}

export function isBsonSerializableTimestamp(input: unknown): input is Partial<BsonSerializableTimestamp> {
  return canBeABsonSerializableValue(input, 'timestamp');
}

export function isBsonSerializableInt64(input: unknown): input is Partial<BsonSerializableInt64> {
  return canBeABsonSerializableValue(input, 'int64');
}

export function isBsonSerializableDecimal128(input: unknown): input is Partial<BsonSerializableDecimal128> {
  return canBeABsonSerializableValue(input, 'decimal128');
}

export function isBsonSerializableMinKey(input: unknown): input is Partial<BsonSerializableMinKey> {
  return canBeABsonSerializableValue(input, 'min-key');
}

export function isBsonSerializableMaxKey(input: unknown): input is Partial<BsonSerializableMaxKey> {
  return canBeABsonSerializableValue(input, 'max-key');
}


export function isValidBsonSerializableDouble(input: Partial<BsonSerializableDouble>): input is BsonSerializableDouble {
  if (!isBsonSerializableDouble(input) || !isSerializableNumericType(input)) return false;

  const number = input[1]!;

  return isBinarySequence(number)
    ? getLength(number) === 8
    : isValidDecimal64(number);
}

export function isValidBsonSerializableString(input: Partial<BsonSerializableString>): input is BsonSerializableString {
  return isBsonSerializableString(input)
    && input.length === 2
    && typeof input[1] === 'string';
}

export function isValidBsonSerializableObject(input: Partial<BsonSerializableObject>): input is BsonSerializableObject {
  return isBsonSerializableObject(input)
    && input.length === 2
    && isBsonObject(input[1]);
}

export function isValidBsonSerializableArray(input: Partial<BsonSerializableArray>): input is BsonSerializableArray {
  return isBsonSerializableArray(input)
    && input.length === 2
    && isBsonArray(input[1]);
}

export function isValidBsonSerializableBinary(input: Partial<BsonSerializableBinary>): input is BsonSerializableBinary {
  return isBsonSerializableBinary(input)
    && input.length === 3
    && isBsonBinarySubType(input[1])
    && isBinarySequence(input[2]);
}

export function isValidBsonSerializableObjectId(input: Partial<BsonSerializableObjectId>): input is BsonSerializableObjectId {
  return isBsonSerializableObjectId(input)
    && input.length === 2
    && isBinarySequence(input[1])
    && getLength(input[1]) === 12;
}

export function isValidBsonSerializableBoolean(input: Partial<BsonSerializableBoolean>): input is BsonSerializableBoolean {
  return isBsonSerializableBoolean(input)
    && input.length === 2
    && typeof input[1] === 'boolean';
}

export function isValidBsonSerializableUtcDatetime(input: Partial<BsonSerializableUtcDatetime>): input is BsonSerializableUtcDatetime {
  if (!isBsonSerializableUtcDatetime(input) || !isSerializableNumericType(input)) return false;

  const number = input[1]!;

  return isBinarySequence(number)
    ? getLength(number) === 8
    : isValidInt64(number);
}

export function isValidBsonSerializableNull(input: Partial<BsonSerializableNull>): input is BsonSerializableNull {
  return isBsonSerializableNull(input)
    && input.length === 1;
}

export function isValidBsonSerializableRegularExpression(input: Partial<BsonSerializableRegularExpression>): input is BsonSerializableRegularExpression {
  if (!isBsonSerializableRegularExpression(input)) return false;
  if (input.length < 2 || input.length > 3) return false;

  const valid = input.length === 2
    ? (input[1] instanceof RegExp)
    : (typeof input[1] === 'string' && input[2] === 'string');

  if (!valid) return false;
  if (input.length === 3) {
    try {
      new RegExp(input[1]!);
    } catch {
      return false;
    }
  }

  const flags = input.length === 2
    ? (input[1]! as RegExp).flags
    : input[2]!;

  return typeof flags === 'string'
    && flags.length <= REGEXP_FLAGS_MAX
    && !REGEXP_FLAGS_CHECK.test(flags);
}

export function isValidBsonSerializableCode(input: Partial<BsonSerializableCode>): input is BsonSerializableCode {
  return isBsonSerializableCode(input)
    && input.length === 2
    && typeof input[1] === 'string';
}

export function isValidBsonSerializableSymbol(input: Partial<BsonSerializableSymbol>): input is BsonSerializableSymbol {
  return isBsonSerializableSymbol(input)
    && input.length === 2
    && typeof input[1] === 'string';
}

export function isValidBsonSerializableCodeWithScope(input: Partial<BsonSerializableCodeWithScope>): input is BsonSerializableCodeWithScope {
  return isBsonSerializableCodeWithScope(input)
    && input.length === 3
    && typeof input[1] === 'string'
    && isBsonObject(input[2]);
}

export function isValidBsonSerializableInt32(input: Partial<BsonSerializableInt32>): input is BsonSerializableInt32 {
  if (!isBsonSerializableInt32(input) || !isSerializableNumericType(input)) return false;

  const number = input[1]!;

  return isBinarySequence(number)
    ? getLength(number) === 4
    : isValidInt32(number);
}

export function isValidBsonSerializableTimestamp(input: Partial<BsonSerializableTimestamp>): input is BsonSerializableTimestamp {
  if (!isBsonSerializableTimestamp(input) || !isSerializableNumericType(input)) return false;

  const number = input[1]!;

  return isBinarySequence(number)
    ? getLength(number) === 8
    : isValidUInt64(number);
}

export function isValidBsonSerializableInt64(input: Partial<BsonSerializableInt64>): input is BsonSerializableInt64 {
  if (!isBsonSerializableInt64(input) || !isSerializableNumericType(input)) return false;

  const number = input[1]!;

  return isBinarySequence(number)
    ? getLength(number) === 8
    : isValidInt64(number);
}

export function isValidBsonSerializableDecimal128(input: Partial<BsonSerializableDecimal128>): input is BsonSerializableDecimal128 {
  if (!isBsonSerializableDecimal128(input) || !isSerializableNumericType(input)) return false;

  const number = input[1]!;

  return isBinarySequence(number)
    ? getLength(number) === 16
    : isValidDecimal128(number);
}

export function isValidBsonSerializableMinKey(input: Partial<BsonSerializableMinKey>): input is BsonSerializableMinKey {
  return isBsonSerializableMinKey(input)
    && input.length === 1;
}

export function isValidBsonSerializableMaxKey(input: Partial<BsonSerializableMaxKey>): input is BsonSerializableMaxKey {
  return isBsonSerializableMaxKey(input)
    && input.length === 1;
}
