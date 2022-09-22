import * as constants from "../../../constants.ts";
import { Reader } from "../../../utils/simple-buffer.ts";
import { readTypeAndKey } from "../../_utils.ts";

export function deserialize(reader: Reader): Uint8Array {
  const [type] = readTypeAndKey(reader);

  if (type !== constants.TYPE_OBJECT_ID) throw new Error(""); // TODO

  return reader.read(12).slice();
}
