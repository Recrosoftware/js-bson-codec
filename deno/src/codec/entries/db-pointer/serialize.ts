import * as constants from "../../../constants.ts";
import { BsonSerializableDbPointer } from "../../../constants.ts";
import { BSONError } from "../../../error.ts";
import { BinarySequence } from "../../../utils/binary-sequence.ts";
import { Writer } from "../../../utils/simple-buffer.ts";
import { isValidBsonSerializableDbPointer } from "../../../utils/validations.ts";
import { writeString, writeTypeAndKey } from "../../_utils.ts";

export function serialize(
  writer: Writer,
  key: string,
  ser: BsonSerializableDbPointer,
): void {
  if (!isValidBsonSerializableDbPointer(ser)) {
    throw new BSONError(`Invalid DbPointer serializable value`);
  }

  const reference: string = ser[1];
  const objectId: BinarySequence = ser[2];

  writeTypeAndKey(writer, constants.TYPE_OBJECT_ID, key);

  writeString(writer, reference);
  writer.write(objectId);
}
