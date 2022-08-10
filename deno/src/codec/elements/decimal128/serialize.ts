import * as constants from "../../../constants.ts";
import { BsonSerializableDecimal128 } from "../../../constants.ts";
import { BSONError } from "../../../error.ts";
import { BinarySequence } from "../../../utils/binary-sequence.ts";
import { Writer } from "../../../utils/simple-buffer.ts";
import { isValidBsonSerializableDecimal128 } from "../../../utils/validations.ts";
import { writeFloat128, writeTypeAndKey } from "../../_utils.ts";

export function serialize(
  writer: Writer,
  key: string,
  ser: BsonSerializableDecimal128,
): void {
  if (!isValidBsonSerializableDecimal128(ser)) {
    throw new BSONError(`Invalid Decimal128 serializable value`);
  }

  const number: number | bigint | BinarySequence = ser[1];

  writeTypeAndKey(writer, constants.TYPE_DECIMAL128, key);
  writeFloat128(writer, number);
}
