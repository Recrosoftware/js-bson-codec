import * as constants from "../../../constants.ts";
import {
  BsonBinarySubtype,
  BsonSerializableBinary,
} from "../../../constants.ts";
import { BSONError } from "../../../error.ts";
import { BinarySequence, getLength } from "../../../utils/binary-sequence.ts";
import { Writer } from "../../../utils/simple-buffer.ts";
import { isValidBsonSerializableBinary } from "../../../utils/validations.ts";
import { writeTypeAndKey, writeUInt32, writeUInt8 } from "../../_utils.ts";

export function serialize(
  writer: Writer,
  key: string,
  ser: BsonSerializableBinary,
): void {
  if (!isValidBsonSerializableBinary(ser)) {
    throw new BSONError(`Invalid Binary serializable value`);
  }

  const subType: BsonBinarySubtype = ser[1];
  const data: BinarySequence = ser[2];

  writeTypeAndKey(writer, constants.TYPE_BINARY_DATA, key);
  writeUInt32(writer, getLength(data));
  writeUInt8(writer, subType);
  writer.write(data);
}
