import * as constants from "../../../constants.ts";
import { BsonSerializableSymbol } from "../../../constants.ts";
import { BSONError } from "../../../error.ts";
import { Writer } from "../../../utils/simple-buffer.ts";
import { isValidBsonSerializableSymbol } from "../../../utils/validations.ts";
import { writeString, writeTypeAndKey } from "../../_utils.ts";

export function serialize(
  writer: Writer,
  key: string,
  ser: BsonSerializableSymbol,
): void {
  if (!isValidBsonSerializableSymbol(ser)) {
    throw new BSONError(`Invalid Symbol serializable value`);
  }

  const symbol: string = ser[1];

  writeTypeAndKey(writer, constants.TYPE_SYMBOL, key);
  writeString(writer, symbol);
}
