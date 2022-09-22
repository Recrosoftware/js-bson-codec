import * as constants from "../../../constants.ts";
import { BsonSerializableRegularExpression } from "../../../constants.ts";
import { BSONError } from "../../../error.ts";
import { Writer } from "../../../utils/simple-buffer.ts";
import { isValidBsonSerializableRegularExpression } from "../../../utils/validations.ts";
import { writeCString, writeTypeAndKey } from "../../_utils.ts";

export function serialize(
  writer: Writer,
  key: string,
  ser: BsonSerializableRegularExpression,
): void {
  if (!isValidBsonSerializableRegularExpression(ser)) {
    throw new BSONError(`Invalid RegularExpression serializable value`);
  }

  writeTypeAndKey(writer, constants.TYPE_REGULAR_EXPRESSION, key);

  if (ser.length === 2) {
    const regExp: RegExp = ser[1];

    writeCString(writer, regExp.source);
    writeCString(writer, regExp.flags);
  } else {
    const pattern: string = ser[1];
    const flags: string = ser[2];

    writeCString(writer, pattern);
    writeCString(writer, flags);
  }
}
