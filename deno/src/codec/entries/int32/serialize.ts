import * as constants from "../../../constants.ts";
import { BsonSerializableInt32 } from "../../../constants.ts";
import { BSONError } from "../../../error.ts";
import { BinarySequence } from "../../../utils/binary-sequence.ts";
import { Writer } from "../../../utils/simple-buffer.ts";
import { isValidBsonSerializableInt32 } from "../../../utils/validations.ts";
import { writeInt32, writeTypeAndKey } from "../../_utils.ts";

export function serialize(
  writer: Writer,
  key: string,
  ser: BsonSerializableInt32,
): void {
  if (!isValidBsonSerializableInt32(ser)) {
    throw new BSONError(`Invalid Int32 serializable value`);
  }

  const number: number | bigint | BinarySequence = ser[1];

  writeTypeAndKey(writer, constants.TYPE_INT32, key);
  writeInt32(writer, number);
}
