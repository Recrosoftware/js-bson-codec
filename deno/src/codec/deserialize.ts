import * as constants from "../constants.ts";
import { Reader } from "../utils/simple-buffer.ts";
import { readInt32, readTypeAndKey, readUint8 } from "./_utils.ts";
import { deserialize as deserializeArray } from "./entries/array/deserialize.ts";
import { deserialize as deserializeBinary } from "./entries/binary/deserialize.ts";
import { deserialize as deserializeBoolean } from "./entries/boolean/deserialize.ts";
import { deserialize as deserializeCodeWithScope } from "./entries/code-with-scope/deserialize.ts";
import { deserialize as deserializeCode } from "./entries/code/deserialize.ts";
import { deserialize as deserializeDbPointer } from "./entries/db-pointer/deserialize.ts";
import { deserialize as deserializeDecimal128 } from "./entries/decimal128/deserialize.ts";
import { deserialize as deserializeDouble } from "./entries/double/deserialize.ts";
import { deserialize as deserializeInt32 } from "./entries/int32/deserialize.ts";
import { deserialize as deserializeInt64 } from "./entries/int64/deserialize.ts";
import { deserialize as deserializeMaxKey } from "./entries/max-key/deserialize.ts";
import { deserialize as deserializeMinKey } from "./entries/min-key/deserialize.ts";
import { deserialize as deserializeNull } from "./entries/null/deserialize.ts";
import { deserialize as deserializeObjectId } from "./entries/object-id/deserialize.ts";
import { deserialize as deserializeObject } from "./entries/object/deserialize.ts";
import { deserialize as deserializeRegularExpression } from "./entries/regular-expression/deserialize.ts";
import { deserialize as deserializeString } from "./entries/string/deserialize.ts";
import { deserialize as deserializeSymbol } from "./entries/symbol/deserialize.ts";
import { deserialize as deserializeTimestamp } from "./entries/timestamp/deserialize.ts";
import { deserialize as deserializeUndefined } from "./entries/undefined/deserialize.ts";
import { deserialize as deserializeUtcDatetime } from "./entries/utc-datetime/deserialize.ts";
import { DeserializeOptions } from "./options.ts";

function applyConversion<T, R>(value: T, converter?: (value: T) => R): T | R {
  return converter ? converter(value) : value;
}

export function deserialize(
  reader: Reader,
  options?: DeserializeOptions,
): Record<string, unknown> {
  return applyConversion(
    Object.fromEntries(deserializeEntries(reader, options)),
    options?.converters?.convertObject,
  );
}

export function deserializeEntries(
  reader: Reader,
  options?: DeserializeOptions,
): [string, unknown][] {
  const initialPosition = reader.position;

  const [objectLength] = readInt32(reader);
  if (objectLength < 0) throw new Error(""); // TODO

  const finalPosition = initialPosition + objectLength;

  const entries: [string, unknown][] = [];

  while (reader.position < (finalPosition - 1)) {
    const [type, key] = readTypeAndKey(reader, true);

    let value: unknown;

    if (type === constants.TYPE_EMBEDDED_ARRAY) {
      value = applyConversion(
        deserializeArray(reader, options),
        options?.converters?.convertArray,
      );
    } else if (type === constants.TYPE_BINARY_DATA) {
      value = applyConversion(
        deserializeBinary(reader),
        options?.converters?.convertBinary,
      );
    } else if (type === constants.TYPE_BOOLEAN) {
      value = applyConversion(
        deserializeBoolean(reader),
        options?.converters?.convertBoolean,
      );
    } else if (type === constants.TYPE_CODE) {
      value = applyConversion(
        deserializeCode(reader),
        options?.converters?.convertCode,
      );
    } else if (type === constants.TYPE_CODE_WITH_SCOPE) {
      value = applyConversion(
        deserializeCodeWithScope(reader, options),
        options?.converters?.convertCodeWithScope,
      );
    } else if (type === constants.TYPE_DB_POINTER) {
      value = applyConversion(
        deserializeDbPointer(reader),
        options?.converters?.convertDbPointer,
      );
    } else if (type === constants.TYPE_DECIMAL128) {
      value = applyConversion(
        deserializeDecimal128(reader),
        options?.converters?.convertDecimal128,
      );
    } else if (type === constants.TYPE_DOUBLE) {
      value = applyConversion(
        deserializeDouble(reader),
        options?.converters?.convertDouble,
      );
    } else if (type === constants.TYPE_INT32) {
      value = applyConversion(
        deserializeInt32(reader),
        options?.converters?.convertInt32,
      );
    } else if (type === constants.TYPE_INT64) {
      value = applyConversion(
        deserializeInt64(reader),
        options?.converters?.convertInt64,
      );
    } else if (type === constants.TYPE_MAX_KEY) {
      value = applyConversion(
        deserializeMaxKey(reader),
        options?.converters?.convertMaxKey,
      );
    } else if (type === constants.TYPE_MIN_KEY) {
      value = applyConversion(
        deserializeMinKey(reader),
        options?.converters?.convertMinKey,
      );
    } else if (type === constants.TYPE_NULL) {
      value = applyConversion(
        deserializeNull(reader),
        options?.converters?.convertNull,
      );
    } else if (type === constants.TYPE_EMBEDDED_OBJECT) {
      // Object deserialization already handles proper conversion
      value = deserializeObject(reader, options);
    } else if (type === constants.TYPE_OBJECT_ID) {
      value = applyConversion(
        deserializeObjectId(reader),
        options?.converters?.convertObjectId,
      );
    } else if (type === constants.TYPE_REGULAR_EXPRESSION) {
      value = applyConversion(
        deserializeRegularExpression(reader),
        options?.converters?.convertRegularExpression,
      );
    } else if (type === constants.TYPE_STRING) {
      value = applyConversion(
        deserializeString(reader),
        options?.converters?.convertString,
      );
    } else if (type === constants.TYPE_SYMBOL) {
      value = applyConversion(
        deserializeSymbol(reader),
        options?.converters?.convertSymbol,
      );
    } else if (type === constants.TYPE_TIMESTAMP) {
      value = applyConversion(
        deserializeTimestamp(reader),
        options?.converters?.convertTimestamp,
      );
    } else if (type === constants.TYPE_UNDEFINED) {
      value = applyConversion(
        deserializeUndefined(reader),
        options?.converters?.convertUndefined,
      );
    } else if (type === constants.TYPE_UTC_DATETIME) {
      value = applyConversion(
        deserializeUtcDatetime(reader),
        options?.converters?.convertUtcDatetime,
      );
    } else {
      throw new Error(""); // TODO: Throw
    }

    entries.push([key, value]);
  }
  if (reader.position !== (finalPosition - 1)) throw new Error(""); // TODO

  const [zero] = readUint8(reader);
  if (zero !== 0) throw new Error(""); // TODO

  return entries;
}
