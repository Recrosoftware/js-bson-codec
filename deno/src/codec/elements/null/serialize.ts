import * as constants from "../../../constants.ts";
import { BsonSerializableNull } from "../../../constants.ts";
import { BSONError } from "../../../error.ts";
import { Writer } from "../../../utils/simple-buffer.ts";
import { isValidBsonSerializableNull } from "../../../utils/validations.ts";
import { writeTypeAndKey } from "../../_utils.ts";

export function serialize(
  writer: Writer,
  key: string,
  ser: BsonSerializableNull,
): void {
  if (!isValidBsonSerializableNull(ser)) {
    throw new BSONError(`Invalid Null serializable value`);
  }

  writeTypeAndKey(writer, constants.TYPE_NULL, key);
}
