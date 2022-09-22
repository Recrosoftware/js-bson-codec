import * as constants from "../../../constants.ts";
import { BsonSerializableMinKey } from "../../../constants.ts";
import { BSONError } from "../../../error.ts";
import { Writer } from "../../../utils/simple-buffer.ts";
import { isValidBsonSerializableMinKey } from "../../../utils/validations.ts";
import { writeTypeAndKey } from "../../_utils.ts";

export function serialize(
  writer: Writer,
  key: string,
  ser: BsonSerializableMinKey,
): void {
  if (!isValidBsonSerializableMinKey(ser)) {
    throw new BSONError(`Invalid MinKey serializable value`);
  }

  writeTypeAndKey(writer, constants.TYPE_MIN_KEY, key);
}
