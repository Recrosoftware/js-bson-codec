import * as constants from "../../../constants.ts";
import { Reader } from "../../../utils/simple-buffer.ts";
import { readTypeAndKey, readUInt64 } from "../../_utils.ts";

export function deserialize(reader: Reader): bigint {
  const [type] = readTypeAndKey(reader);

  if (type !== constants.TYPE_TIMESTAMP) throw new Error(""); // TODO

  const [value] = readUInt64(reader);

  return value;
}
