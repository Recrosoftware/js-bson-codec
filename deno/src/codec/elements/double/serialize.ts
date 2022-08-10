import * as constants from "../../../constants.ts";
import { BsonSerializableDouble } from "../../../constants.ts";
import { BSONError } from "../../../error.ts";
import { BinarySequence } from "../../../utils/binary-sequence.ts";
import { Writer } from "../../../utils/simple-buffer.ts";
import { isValidBsonSerializableDouble } from "../../../utils/validations.ts";
import { writeFloat64, writeTypeAndKey } from "../../_utils.ts";

export function serialize(
  writer: Writer,
  key: string,
  ser: BsonSerializableDouble,
): void {
  if (!isValidBsonSerializableDouble(ser)) {
    throw new BSONError(`Invalid Double serializable value`);
  }

  const value: number | bigint | BinarySequence = ser[1];

  writeTypeAndKey(writer, constants.TYPE_DOUBLE, key);
  writeFloat64(writer, value);
}
