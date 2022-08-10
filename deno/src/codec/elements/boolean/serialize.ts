import * as constants from "../../../constants.ts";
import { BsonSerializableBoolean } from "../../../constants.ts";
import { BSONError } from "../../../error.ts";
import { Writer } from "../../../utils/simple-buffer.ts";
import { isValidBsonSerializableBoolean } from "../../../utils/validations.ts";
import { writeTypeAndKey, writeUInt8 } from "../../_utils.ts";

export function serialize(
  writer: Writer,
  key: string,
  ser: BsonSerializableBoolean,
): void {
  if (!isValidBsonSerializableBoolean(ser)) {
    throw new BSONError(`Invalid Boolean serializable value`);
  }

  const value: boolean = ser[1];

  writeTypeAndKey(writer, constants.TYPE_BOOLEAN, key);
  writeUInt8(
    writer,
    value ? constants.VALUE_BOOLEAN_TRUE : constants.VALUE_BOOLEAN_FALSE,
  );
}
