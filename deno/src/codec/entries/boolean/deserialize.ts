import * as constants from "../../../constants.ts";
import { Reader } from "../../../utils/simple-buffer.ts";
import { readTypeAndKey, readUint8 } from "../../_utils.ts";

export function deserialize(reader: Reader): boolean {
  const [type] = readTypeAndKey(reader);

  if (type !== constants.TYPE_BOOLEAN) throw new Error(""); // TODO

  const [rawValue] = readUint8(reader);
  const value = rawValue === constants.VALUE_BOOLEAN_TRUE
    ? true
    : rawValue === constants.VALUE_BOOLEAN_FALSE
    ? false
    : undefined;

  if (value == null) throw new Error(""); // TODO

  return value;
}
