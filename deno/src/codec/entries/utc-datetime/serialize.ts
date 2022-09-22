import * as constants from "../../../constants.ts";
import { BsonSerializableUtcDatetime } from "../../../constants.ts";
import { BSONError } from "../../../error.ts";
import { BinarySequence } from "../../../utils/binary-sequence.ts";
import { Writer } from "../../../utils/simple-buffer.ts";
import { isValidBsonSerializableUtcDatetime } from "../../../utils/validations.ts";
import { writeInt64, writeTypeAndKey } from "../../_utils.ts";

export function serialize(
  writer: Writer,
  key: string,
  ser: BsonSerializableUtcDatetime,
): void {
  if (!isValidBsonSerializableUtcDatetime(ser)) {
    throw new BSONError(`Invalid UTCDatetime serializable value`);
  }

  const millisSinceEpochStart: number | bigint | BinarySequence = ser[1];

  writeTypeAndKey(writer, constants.TYPE_UTC_DATETIME, key);
  writeInt64(writer, millisSinceEpochStart);
}
