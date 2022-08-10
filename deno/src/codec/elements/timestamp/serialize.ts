import * as constants from "../../../constants.ts";
import { BsonSerializableTimestamp } from "../../../constants.ts";
import { BSONError } from "../../../error.ts";
import { BinarySequence } from "../../../utils/binary-sequence.ts";
import { Writer } from "../../../utils/simple-buffer.ts";
import { isValidBsonSerializableTimestamp } from "../../../utils/validations.ts";
import { writeTypeAndKey, writeUInt64 } from "../../_utils.ts";

export function serialize(
  writer: Writer,
  key: string,
  ser: BsonSerializableTimestamp,
): void {
  if (!isValidBsonSerializableTimestamp(ser)) {
    throw new BSONError(`Invalid Timestamp serializable value`);
  }

  const timestamp: number | bigint | BinarySequence = ser[1];

  writeTypeAndKey(writer, constants.TYPE_TIMESTAMP, key);
  writeUInt64(writer, timestamp);
}
