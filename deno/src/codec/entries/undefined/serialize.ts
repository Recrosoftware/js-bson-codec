import * as constants from "../../../constants.ts";
import { BsonSerializableUndefined } from "../../../constants.ts";
import { BSONError } from "../../../error.ts";
import { Writer } from "../../../utils/simple-buffer.ts";
import { isValidBsonSerializableUndefined } from "../../../utils/validations.ts";
import { writeTypeAndKey } from "../../_utils.ts";

export function serialize(
  writer: Writer,
  key: string,
  ser: BsonSerializableUndefined,
): void {
  if (!isValidBsonSerializableUndefined(ser)) {
    throw new BSONError(`Invalid Undefined serializable value`);
  }

  writeTypeAndKey(writer, constants.TYPE_UNDEFINED, key);
}
