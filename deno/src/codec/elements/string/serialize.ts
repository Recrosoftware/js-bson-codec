import * as constants from "../../../constants.ts";
import { BsonSerializableString } from "../../../constants.ts";
import { BSONError } from "../../../error.ts";
import { Writer } from "../../../utils/simple-buffer.ts";
import { isValidBsonSerializableString } from "../../../utils/validations.ts";
import { writeString, writeTypeAndKey } from "../../_utils.ts";

export function serialize(
  writer: Writer,
  key: string,
  ser: BsonSerializableString,
): void {
  if (!isValidBsonSerializableString(ser)) {
    throw new BSONError(`Invalid String serializable value`);
  }

  const str: string = ser[1];

  writeTypeAndKey(writer, constants.TYPE_STRING, key);
  writeString(writer, str);
}
