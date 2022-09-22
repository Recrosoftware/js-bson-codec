import * as constants from "../../../constants.ts";
import { Reader } from "../../../utils/simple-buffer.ts";
import { readTypeAndKey } from "../../_utils.ts";

export function deserialize(reader: Reader): "max-key" {
  const [type] = readTypeAndKey(reader);

  if (type !== constants.TYPE_MAX_KEY) throw new Error(""); // TODO

  return "max-key";
}
