import * as constants from "../../../constants.ts";
import { Reader } from "../../../utils/simple-buffer.ts";
import { readString, readTypeAndKey } from "../../_utils.ts";

export function deserialize(
  reader: Reader,
): [reference: string, objectId: Uint8Array] {
  const [type] = readTypeAndKey(reader);

  if (type !== constants.TYPE_DB_POINTER) throw new Error(""); // TODO

  const [reference] = readString(reader);
  const objectId = reader.read(12).slice();

  return [reference, objectId];
}
