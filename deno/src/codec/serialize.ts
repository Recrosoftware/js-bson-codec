import type { BsonDocument, BsonSerializableValue } from "../constants.ts";
import {
  BsonSerializableValueProvider,
  TO_BSON_SERIALIZABLE_VALUE,
} from "../constants.ts";
import { BSONError } from "../error.ts";
import type { Writer } from "../utils/simple-buffer.ts";
import {
  isBsonArray,
  isBsonDocument,
  isBsonObject,
  isBsonSerializableArray,
  isBsonSerializableBinary,
  isBsonSerializableBoolean,
  isBsonSerializableCode,
  isBsonSerializableCodeWithScope,
  isBsonSerializableDbPointer,
  isBsonSerializableDecimal128,
  isBsonSerializableDouble,
  isBsonSerializableInt32,
  isBsonSerializableInt64,
  isBsonSerializableMaxKey,
  isBsonSerializableMinKey,
  isBsonSerializableNull,
  isBsonSerializableObject,
  isBsonSerializableObjectId,
  isBsonSerializableRegularExpression,
  isBsonSerializableString,
  isBsonSerializableSymbol,
  isBsonSerializableTimestamp,
  isBsonSerializableUndefined,
  isBsonSerializableUtcDatetime,
} from "../utils/validations.ts";
import { UINT32_SIZE, writeInt32, writeUInt8 } from "./_utils.ts";
import { serialize as serializeArray } from "./entries/array/serialize.ts";
import { serialize as serializeBinary } from "./entries/binary/serialize.ts";
import { serialize as serializeBoolean } from "./entries/boolean/serialize.ts";
import { serialize as serializeCodeWithScope } from "./entries/code-with-scope/serialize.ts";
import { serialize as serializeCode } from "./entries/code/serialize.ts";
import { serialize as serializeDbPointer } from "./entries/db-pointer/serialize.ts";
import { serialize as serializeDecimal128 } from "./entries/decimal128/serialize.ts";
import { serialize as serializeDouble } from "./entries/double/serialize.ts";
import { serialize as serializeInt32 } from "./entries/int32/serialize.ts";
import { serialize as serializeInt64 } from "./entries/int64/serialize.ts";
import { serialize as serializeMaxKey } from "./entries/max-key/serialize.ts";
import { serialize as serializeMinKey } from "./entries/min-key/serialize.ts";
import { serialize as serializeNull } from "./entries/null/serialize.ts";
import { serialize as serializeObjectId } from "./entries/object-id/serialize.ts";
import { serialize as serializeObject } from "./entries/object/serialize.ts";
import { serialize as serializeRegularExpression } from "./entries/regular-expression/serialize.ts";
import { serialize as serializeString } from "./entries/string/serialize.ts";
import { serialize as serializeSymbol } from "./entries/symbol/serialize.ts";
import { serialize as serializeTimestamp } from "./entries/timestamp/serialize.ts";
import { serialize as serializeUndefined } from "./entries/undefined/serialize.ts";
import { serialize as serializeUtcDatetime } from "./entries/utc-datetime/serialize.ts";
import { SerializeOptions } from "./options.ts";

export function serialize(
  writer: Writer,
  document: BsonDocument,
  options?: SerializeOptions,
): void {
  if (!isBsonDocument(document)) {
    throw new BSONError(
      `Can't serialize object of type '${typeof document}': '${document}'`,
    );
  }

  const startPosition = writer.position;
  writer.seek(UINT32_SIZE);
  if (isBsonArray(document)) {
    for (let i = 0; i < document.length; ++i) {
      const key = String(i);
      const value = document[i];

      serializeEntry(writer, options, key, value);
    }
  } else {
    const entries = document instanceof Map
      ? document.entries()
      : Object.entries(document);

    for (const [key, value] of entries) {
      serializeEntry(writer, options, key, value);
    }
  }
  writeUInt8(writer, 0);

  const endPosition = writer.position;

  const size = endPosition - startPosition;

  writeInt32(writer, size, startPosition);
}

function isBsonSerializableValueProvider(
  v: unknown,
): v is BsonSerializableValueProvider {
  return (
    typeof v === "object" &&
    v != null &&
    TO_BSON_SERIALIZABLE_VALUE in v &&
    typeof (v as Record<symbol, unknown>)[TO_BSON_SERIALIZABLE_VALUE] ===
    "function"
  );
}

function toBsonObject(
  value: unknown,
  options: SerializeOptions | undefined,
): BsonSerializableValue | undefined {
  const {
    undefined: modeUndefined = "skip",
    symbol: modeSymbol = "skip",
    dbPointer: modeDbPointer = "convert-to-db-ref",
    codeWithScope: modeCodeWithScope = "skip",
  } = options?.deprecated || {};

  let output: BsonSerializableValue | undefined;

  switch (typeof value) {
    case "undefined":
      output = ["undefined"];
      break;
    case "number":
      output = ["double", value];
      break;
    case "bigint":
      output = ["int64", value];
      break;
    case "string":
      output = ["string", value];
      break;
    case "boolean":
      output = ["boolean", value];
      break;
    case "symbol":
      output = ["symbol", value.toString()];
      break;
    case "function":
      output = ["code", value.toString()];
      break;
    case "object":
      if (value === null) {
        output = ["null"];
      } else if (isBsonSerializableValueProvider(value)) {
        output = value[TO_BSON_SERIALIZABLE_VALUE]();
      } else if (isBsonArray(value)) {
        output = ["array", value];
      } else if (isBsonObject(value)) {
        output = ["object", value];
      } else {
        throw new Error(""); // TODO
      }
      break;
  }

  // TODO: Apply deprecation conversions

  return output;
}

function serializeEntry(
  writer: Writer,
  options: SerializeOptions | undefined,
  key: string,
  value: unknown,
): void {
  const serializableValue: BsonSerializableValue | undefined =
    options?.convertValue
      ? options.convertValue(value, (v) => toBsonObject(v, options))
      : toBsonObject(value, options);

  // Skip field serialization
  if (!serializableValue) return;

  if (isBsonSerializableArray(serializableValue)) {
    return serializeArray(writer, key, serializableValue, options);
  }
  if (isBsonSerializableBinary(serializableValue)) {
    return serializeBinary(writer, key, serializableValue);
  }
  if (isBsonSerializableBoolean(serializableValue)) {
    return serializeBoolean(writer, key, serializableValue);
  }
  if (isBsonSerializableCode(serializableValue)) {
    return serializeCode(writer, key, serializableValue);
  }
  if (isBsonSerializableCodeWithScope(serializableValue)) {
    return serializeCodeWithScope(writer, key, serializableValue, options);
  }
  if (isBsonSerializableDbPointer(serializableValue)) {
    return serializeDbPointer(writer, key, serializableValue);
  }
  if (isBsonSerializableDecimal128(serializableValue)) {
    return serializeDecimal128(writer, key, serializableValue);
  }
  if (isBsonSerializableDouble(serializableValue)) {
    return serializeDouble(writer, key, serializableValue);
  }
  if (isBsonSerializableInt32(serializableValue)) {
    return serializeInt32(writer, key, serializableValue);
  }
  if (isBsonSerializableInt64(serializableValue)) {
    return serializeInt64(writer, key, serializableValue);
  }
  if (isBsonSerializableMaxKey(serializableValue)) {
    return serializeMaxKey(writer, key, serializableValue);
  }
  if (isBsonSerializableMinKey(serializableValue)) {
    return serializeMinKey(writer, key, serializableValue);
  }
  if (isBsonSerializableNull(serializableValue)) {
    return serializeNull(writer, key, serializableValue);
  }
  if (isBsonSerializableObject(serializableValue)) {
    return serializeObject(writer, key, serializableValue, options);
  }
  if (isBsonSerializableObjectId(serializableValue)) {
    return serializeObjectId(writer, key, serializableValue);
  }
  if (isBsonSerializableRegularExpression(serializableValue)) {
    return serializeRegularExpression(writer, key, serializableValue);
  }
  if (isBsonSerializableString(serializableValue)) {
    return serializeString(writer, key, serializableValue);
  }
  if (isBsonSerializableSymbol(serializableValue)) {
    return serializeSymbol(writer, key, serializableValue);
  }
  if (isBsonSerializableTimestamp(serializableValue)) {
    return serializeTimestamp(writer, key, serializableValue);
  }
  if (isBsonSerializableUndefined(serializableValue)) {
    return serializeUndefined(writer, key, serializableValue);
  }
  if (isBsonSerializableUtcDatetime(serializableValue)) {
    return serializeUtcDatetime(writer, key, serializableValue);
  }

  throw new BSONError(""); // TODO: Delegate appropriate serializer
}
