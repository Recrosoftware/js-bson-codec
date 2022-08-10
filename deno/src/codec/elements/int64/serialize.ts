import * as constants from "../../../constants.ts";
import { BsonSerializableInt64 } from "../../../constants.ts";
import { BSONError } from "../../../error.ts";
import { BinarySequence } from "../../../utils/binary-sequence.ts";
import { Writer } from "../../../utils/simple-buffer.ts";
import { isValidBsonSerializableInt64 } from "../../../utils/validations.ts";
import { writeInt64, writeTypeAndKey } from "../../_utils.ts";

export function serialize(
  writer: Writer,
  key: string,
  ser: BsonSerializableInt64,
): void {
  if (!isValidBsonSerializableInt64(ser)) {
    throw new BSONError(`Invalid Int64 serializable value`);
  }

  const number: number | bigint | BinarySequence = ser[1];

  writeTypeAndKey(writer, constants.TYPE_INT64, key);
  writeInt64(writer, number);
}
