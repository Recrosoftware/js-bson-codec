import * as constants from "../../../constants.ts";
import { BsonObject, BsonSerializableObject } from "../../../constants.ts";
import { BSONError } from "../../../error.ts";
import { Writer } from "../../../utils/simple-buffer.ts";
import { isValidBsonSerializableObject } from "../../../utils/validations.ts";
import { writeTypeAndKey } from "../../_utils.ts";
import { serialize as serializeRoot } from "../../serialize.ts";

export function serialize(
  writer: Writer,
  key: string,
  ser: BsonSerializableObject,
): void {
  if (!isValidBsonSerializableObject(ser)) {
    throw new BSONError(`Invalid Object serializable value`);
  }

  const object: BsonObject = ser[1];

  writeTypeAndKey(writer, constants.TYPE_EMBEDDED_OBJECT, key);
  serializeRoot(writer, object);
}
