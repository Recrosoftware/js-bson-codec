import type { BsonDocument, BsonSerializableValue } from "../constants.ts";
import { BSONError } from "../error.ts";
import type { Writer } from "../utils/simple-buffer.ts";
import {
  isBsonArray,
  isBsonDocument,
  isBsonSerializableArray,
  isBsonSerializableBinary,
  isBsonSerializableBoolean,
  isBsonSerializableCode,
  isBsonSerializableCodeWithScope,
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
import { UINT32_SIZE, writeUInt32, writeUInt8 } from "./_utils.ts";
import { serialize as serializeArray } from "./elements/array/serialize.ts";
import { serialize as serializeBinary } from "./elements/binary/serialize.ts";
import { serialize as serializeBoolean } from "./elements/boolean/serialize.ts";
import { serialize as serializeCodeWithScope } from "./elements/code-with-scope/serialize.ts";
import { serialize as serializeCode } from "./elements/code/serialize.ts";
import { serialize as serializeDecimal128 } from "./elements/decimal128/serialize.ts";
import { serialize as serializeDouble } from "./elements/double/serialize.ts";
import { serialize as serializeInt32 } from "./elements/int32/serialize.ts";
import { serialize as serializeInt64 } from "./elements/int64/serialize.ts";
import { serialize as serializeMaxKey } from "./elements/max-key/serialize.ts";
import { serialize as serializeMinKey } from "./elements/min-key/serialize.ts";
import { serialize as serializeNull } from "./elements/null/serialize.ts";
import { serialize as serializeObjectId } from "./elements/object-id/serialize.ts";
import { serialize as serializeObject } from "./elements/object/serialize.ts";
import { serialize as serializeRegularExpression } from "./elements/reg-exp/serialize.ts";
import { serialize as serializeString } from "./elements/string/serialize.ts";
import { serialize as serializeSymbol } from "./elements/symbol/serialize.ts";
import { serialize as serializeTimestamp } from "./elements/timestamp/serialize.ts";
import { serialize as serializeUndefined } from "./elements/undefined/serialize.ts";
import { serialize as serializeUtcDatetime } from "./elements/utc-datetime/serialize.ts";

export function serialize(writer: Writer, document: BsonDocument): void {
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

  // TODO: Convert to `value` to BsonSerializableValue

  // Skip field serialization
  if (!serializableValue) return;

  if (isBsonSerializableArray(serializableValue)) {
    serializeArray(writer, key, serializableValue);
  } else if (isBsonSerializableBinary(serializableValue)) {
    serializeBinary(writer, key, serializableValue);
  } else if (isBsonSerializableBoolean(serializableValue)) {
    serializeBoolean(writer, key, serializableValue);
  } else if (isBsonSerializableCode(serializableValue)) {
    serializeCode(writer, key, serializableValue);
  } else if (isBsonSerializableCodeWithScope(serializableValue)) {
    serializeCodeWithScope(writer, key, serializableValue);
  } else if (isBsonSerializableDecimal128(serializableValue)) {
    serializeDecimal128(writer, key, serializableValue);
  } else if (isBsonSerializableDouble(serializableValue)) {
    serializeDouble(writer, key, serializableValue);
  } else if (isBsonSerializableInt32(serializableValue)) {
    serializeInt32(writer, key, serializableValue);
  } else if (isBsonSerializableInt64(serializableValue)) {
    serializeInt64(writer, key, serializableValue);
  } else if (isBsonSerializableMaxKey(serializableValue)) {
    serializeMaxKey(writer, key, serializableValue);
  } else if (isBsonSerializableMinKey(serializableValue)) {
    serializeMinKey(writer, key, serializableValue);
  } else if (isBsonSerializableNull(serializableValue)) {
    serializeNull(writer, key, serializableValue);
  } else if (isBsonSerializableObject(serializableValue)) {
    serializeObject(writer, key, serializableValue);
  } else if (isBsonSerializableObjectId(serializableValue)) {
    serializeObjectId(writer, key, serializableValue);
  } else if (isBsonSerializableRegularExpression(serializableValue)) {
    serializeRegularExpression(writer, key, serializableValue);
  } else if (isBsonSerializableString(serializableValue)) {
    serializeString(writer, key, serializableValue);
  } else if (isBsonSerializableSymbol(serializableValue)) {
    serializeSymbol(writer, key, serializableValue);
  } else if (isBsonSerializableTimestamp(serializableValue)) {
    serializeTimestamp(writer, key, serializableValue);
  } else if (isBsonSerializableUndefined(serializableValue)) {
    serializeUndefined(writer, key, serializableValue);
  } else if (isBsonSerializableUtcDatetime(serializableValue)) {
    serializeUtcDatetime(writer, key, serializableValue);
  }

  throw new BSONError(""); // TODO: Delegate appropriate serializer
}

// |	"\x0C" e_name string (byte*12)	DBPointer — Deprecated
