import * as constants from "../../../constants.ts";
import { BsonSerializableObjectId } from "../../../constants.ts";
import { BSONError } from "../../../error.ts";
import { BinarySequence } from "../../../utils/binary-sequence.ts";
import { Writer } from "../../../utils/simple-buffer.ts";
import { isValidBsonSerializableObjectId } from "../../../utils/validations.ts";
import { writeTypeAndKey } from "../../_utils.ts";

export function serialize(
  writer: Writer,
  key: string,
  ser: BsonSerializableObjectId,
): void {
  if (!isValidBsonSerializableObjectId(ser)) {
    throw new BSONError(`Invalid ObjectId serializable value`);
  }

  const objectId: BinarySequence = ser[1];

  writeTypeAndKey(writer, constants.TYPE_OBJECT_ID, key);
  writer.write(objectId);
}
