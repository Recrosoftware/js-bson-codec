import * as constants from "../../../constants.ts";
import { BsonSerializableCode } from "../../../constants.ts";
import { BSONError } from "../../../error.ts";
import { Writer } from "../../../utils/simple-buffer.ts";
import { isValidBsonSerializableCode } from "../../../utils/validations.ts";
import { writeString, writeTypeAndKey } from "../../_utils.ts";

export function serialize(
  writer: Writer,
  key: string,
  ser: BsonSerializableCode,
): void {
  if (!isValidBsonSerializableCode(ser)) {
    throw new BSONError(`Invalid Code serializable value`);
  }

  const code: string = ser[1];

  writeTypeAndKey(writer, constants.TYPE_CODE, key);
  writeString(writer, code);
}
