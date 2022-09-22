import * as constants from "../../../constants.ts";
import { Reader } from "../../../utils/simple-buffer.ts";
import { readString, readTypeAndKey } from "../../_utils.ts";

export function deserialize(reader: Reader): string {
  const [type] = readTypeAndKey(reader);

  if (type !== constants.TYPE_CODE) throw new Error(""); // TODO

  const [code] = readString(reader);

  return code;
}
