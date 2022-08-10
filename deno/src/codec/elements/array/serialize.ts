import * as constants from "../../../constants.ts";
import { BsonArray, BsonSerializableArray } from "../../../constants.ts";
import { BSONError } from "../../../error.ts";
import { Writer } from "../../../utils/simple-buffer.ts";
import { isValidBsonSerializableArray } from "../../../utils/validations.ts";
import { writeTypeAndKey } from "../../_utils.ts";
import { serialize as serializeRoot } from "../../serialize.ts";

export function serialize(
  writer: Writer,
  key: string,
  ser: BsonSerializableArray,
): void {
  if (!isValidBsonSerializableArray(ser)) {
    throw new BSONError(`Invalid Array serializable value`);
  }

  const array: BsonArray = ser[1];

  writeTypeAndKey(writer, constants.TYPE_EMBEDDED_ARRAY, key);
  serializeRoot(writer, array);
}
