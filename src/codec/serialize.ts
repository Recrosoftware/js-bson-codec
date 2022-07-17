import {Writer} from '../buffer.ts';
import * as constants from '../constants.ts';
import {
  BsonDocument,
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
import {BSONError} from '../error.ts';
import {
  isBsonArray,
  isBsonDocument,
  isValidBsonSerializableArray,
  isValidBsonSerializableBinary,
  isValidBsonSerializableBoolean,
  isValidBsonSerializableCode,
  isValidBsonSerializableCodeWithScope,
  isValidBsonSerializableDecimal128,
  isValidBsonSerializableDouble,
  isValidBsonSerializableInt32,
  isValidBsonSerializableInt64,
  isValidBsonSerializableMaxKey,
  isValidBsonSerializableMinKey,
  isValidBsonSerializableNull,
  isValidBsonSerializableObject,
  isValidBsonSerializableObjectId,
  isValidBsonSerializableRegularExpression,
  isValidBsonSerializableString,
  isValidBsonSerializableSymbol,
  isValidBsonSerializableTimestamp,
  isValidBsonSerializableUtcDatetime
} from '../utils/validations.ts';
import {
  UINT32_SIZE,
  writeCString,
  writeFloat128,
  writeFloat64,
  writeInt32,
  writeInt64,
  writeString,
  writeTypeAndKey,
  writeUInt32,
  writeUInt64,
  writeUInt8
} from './_utils.ts';


function serialize(writer: Writer, document: BsonDocument): void {
  if (!isBsonDocument(document))
    throw new BSONError(`Can't serialize object of type '${typeof document}': '${document}'`);

  const startPosition = writer.position;
  writer.seek(UINT32_SIZE);
  if (isBsonArray(document)) {
    for (let i = 0; i < document.length; ++i) {
      const key = String(i);
      const value = document[i];

      serializeElement(writer, key, value);
    }
  } else {
    const entries = document instanceof Map
      ? document.entries()
      : Object.entries(document);

    for (const [key, value] of entries) serializeElement(writer, key, value);
  }
  writeUInt8(writer, 0);

  const endPosition = writer.position;

  const size = endPosition - startPosition;

  writeUInt32(writer, size + UINT32_SIZE, startPosition);
}

function serializeElement(writer: Writer, key: string, value: unknown): void {
  let serializableValue: BsonSerializableValue | undefined;

  // TODO: Convert to serializable value

  // Skip field serialization
  if (!serializableValue) return;


  // TODO: Delegate appropriate serializer
}

function serializeElement_Double(writer: Writer, key: string, ser: BsonSerializableDouble): void {
  if (!isValidBsonSerializableDouble(ser)) throw new BSONError(`Invalid Double serializable value`);

  const [, value] = ser;

  writeTypeAndKey(writer, constants.TYPE_DOUBLE, key);
  writeFloat64(writer, value);
}

function serializeElement_String(writer: Writer, key: string, ser: BsonSerializableString): void {
  if (!isValidBsonSerializableString(ser)) throw new BSONError(`Invalid String serializable value`);

  const [, str] = ser;

  writeTypeAndKey(writer, constants.TYPE_STRING, key);
  writeString(writer, str);
}

function serializeElement_Object(writer: Writer, key: string, ser: BsonSerializableObject): void {
  if (!isValidBsonSerializableObject(ser)) throw new BSONError(`Invalid Object serializable value`);

  const [, object] = ser;

  writeTypeAndKey(writer, constants.TYPE_EMBEDDED_OBJECT, key);
  serialize(writer, object);
}

function serializeElement_Array(writer: Writer, key: string, ser: BsonSerializableArray): void {
  if (!isValidBsonSerializableArray(ser)) throw new BSONError(`Invalid Array serializable value`);

  const [, array] = ser;

  writeTypeAndKey(writer, constants.TYPE_EMBEDDED_ARRAY, key);
  serialize(writer, array);
}

function serializeElement_Binary(writer: Writer, key: string, ser: BsonSerializableBinary): void {
  if (!isValidBsonSerializableBinary(ser)) throw new BSONError(`Invalid Binary serializable value`);

  const [, subType, data] = ser;

  writeTypeAndKey(writer, constants.TYPE_BINARY_DATA, key);
  writeUInt32(writer, data.length);
  writeUInt8(writer, subType);
  writer.write(data);
}

function serializeElement_ObjectId(writer: Writer, key: string, ser: BsonSerializableObjectId): void {
  if (!isValidBsonSerializableObjectId(ser)) throw new BSONError(`Invalid ObjectId serializable value`);

  const [, objectId] = ser;

  writeTypeAndKey(writer, constants.TYPE_OBJECT_ID, key);
  writer.write(objectId);
}

function serializeElement_Boolean(writer: Writer, key: string, ser: BsonSerializableBoolean): void {
  if (!isValidBsonSerializableBoolean(ser)) throw new BSONError(`Invalid Boolean serializable value`);

  const [, value] = ser;

  writeTypeAndKey(writer, constants.TYPE_BOOLEAN, key);
  writeUInt8(writer, value ? constants.VALUE_BOOLEAN_TRUE : constants.VALUE_BOOLEAN_FALSE);
}

function serializeElement_UTCDatetime(writer: Writer, key: string, ser: BsonSerializableUtcDatetime): void {
  if (!isValidBsonSerializableUtcDatetime(ser)) throw new BSONError(`Invalid UTCDatetime serializable value`);

  const [, millisSinceEpochStart] = ser;

  writeTypeAndKey(writer, constants.TYPE_UTC_DATETIME, key);
  writeInt64(writer, millisSinceEpochStart);
}

function serializeElement_Null(writer: Writer, key: string, ser: BsonSerializableNull): void {
  if (!isValidBsonSerializableNull(ser)) throw new BSONError(`Invalid Null serializable value`);

  writeTypeAndKey(writer, constants.TYPE_NULL, key);
}

function serializeElement_RegExp(writer: Writer, key: string, ser: BsonSerializableRegularExpression): void {
  if (!isValidBsonSerializableRegularExpression(ser)) throw new BSONError(`Invalid RegularExpression serializable value`);

  writeTypeAndKey(writer, constants.TYPE_REGULAR_EXPRESSION, key);

  if (ser.length === 2) {
    const [, regExp] = ser;

    writeCString(writer, regExp.source);
    writeCString(writer, regExp.flags);
  } else {
    const [, pattern, flags] = ser;

    writeCString(writer, pattern);
    writeCString(writer, flags);
  }
}

function serializeElement_Code(writer: Writer, key: string, ser: BsonSerializableCode): void {
  if (!isValidBsonSerializableCode(ser)) throw new BSONError(`Invalid Code serializable value`);

  const [, code] = ser;

  writeTypeAndKey(writer, constants.TYPE_CODE, key);
  writeString(writer, code);
}

/* DEPRECATED */
function serializeElement_Symbol(writer: Writer, key: string, ser: BsonSerializableSymbol): void {
  if (!isValidBsonSerializableSymbol(ser)) throw new BSONError(`Invalid Symbol serializable value`);

  const [, symbol] = ser;

  writeTypeAndKey(writer, constants.TYPE_SYMBOL, key);
  writeString(writer, symbol);
}

/* DEPRECATED */
function serializeElement_CodeWithScope(writer: Writer, key: string, ser: BsonSerializableCodeWithScope): void {
  if (!isValidBsonSerializableCodeWithScope(ser)) throw new BSONError(`Invalid CodeWithScope serializable value`);

  const [, code, scope] = ser;

  writeTypeAndKey(writer, constants.TYPE_CODE_WITH_SCOPE, key);

  const startPosition = writer.position;
  writer.seek(UINT32_SIZE);
  writeString(writer, code);
  serialize(writer, scope);
  const endPosition = writer.position;

  const contentSize = endPosition - startPosition;
  writeUInt32(writer, contentSize + UINT32_SIZE, startPosition);
}

function serializeElement_Int32(writer: Writer, key: string, ser: BsonSerializableInt32): void {
  if (!isValidBsonSerializableInt32(ser)) throw new BSONError(`Invalid Int32 serializable value`);

  const [, number] = ser;

  writeTypeAndKey(writer, constants.TYPE_INT32, key);
  writeInt32(writer, number);
}

function serializeElement_Timestamp(writer: Writer, key: string, ser: BsonSerializableTimestamp): void {
  if (!isValidBsonSerializableTimestamp(ser)) throw new BSONError(`Invalid Timestamp serializable value`);

  const [, timestamp] = ser;

  writeTypeAndKey(writer, constants.TYPE_TIMESTAMP, key);
  writeUInt64(writer, timestamp);
}

function serializeElement_Int64(writer: Writer, key: string, ser: BsonSerializableInt64): void {
  if (!isValidBsonSerializableInt64(ser)) throw new BSONError(`Invalid Int64 serializable value`);

  const [, number] = ser;

  writeTypeAndKey(writer, constants.TYPE_INT64, key);
  writeInt64(writer, number);
}

function serializeElement_Decimal128(writer: Writer, key: string, ser: BsonSerializableDecimal128): void {
  if (!isValidBsonSerializableDecimal128(ser)) throw new BSONError(`Invalid Decimal128 serializable value`);

  const [, number] = ser;

  writeTypeAndKey(writer, constants.TYPE_DECIMAL128, key);
  writeFloat128(writer, number);
}

function serializeElement_DecimalMinKey(writer: Writer, key: string, ser: BsonSerializableMinKey): void {
  if (!isValidBsonSerializableMinKey(ser)) throw new BSONError(`Invalid MinKey serializable value`);

  writeTypeAndKey(writer, constants.TYPE_MIN_KEY, key);
}

function serializeElement_DecimalMaxKey(writer: Writer, key: string, ser: BsonSerializableMaxKey): void {
  if (!isValidBsonSerializableMaxKey(ser)) throw new BSONError(`Invalid MaxKey serializable value`);

  writeTypeAndKey(writer, constants.TYPE_MAX_KEY, key);
}
