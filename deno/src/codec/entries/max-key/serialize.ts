import * as constants from "../../../constants.ts";
import { BsonSerializableMaxKey } from "../../../constants.ts";
import { BSONError } from "../../../error.ts";
import { Writer } from "../../../utils/simple-buffer.ts";
import { isValidBsonSerializableMaxKey } from "../../../utils/validations.ts";
import { writeTypeAndKey } from "../../_utils.ts";

export function serialize(
  writer: Writer,
  key: string,
  ser: BsonSerializableMaxKey,
): void {
  if (!isValidBsonSerializableMaxKey(ser)) {
    throw new BSONError(`Invalid MaxKey serializable value`);
  }

  writeTypeAndKey(writer, constants.TYPE_MAX_KEY, key);
}
