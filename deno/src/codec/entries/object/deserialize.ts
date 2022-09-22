import * as constants from "../../../constants.ts";
import { Reader } from "../../../utils/simple-buffer.ts";
import { readInt32, readTypeAndKey } from "../../_utils.ts";
import { deserialize as deserializeRoot } from "../../deserialize.ts";
import { DeserializeOptions } from "../../options.ts";

export function deserialize(
  reader: Reader,
  options?: DeserializeOptions,
): Record<string, unknown> {
  const [type] = readTypeAndKey(reader);

  if (type !== constants.TYPE_EMBEDDED_OBJECT) throw new Error(""); // TODO

  const [length] = readInt32(reader, true);
  if (length < 0) throw new Error(""); // TODO

  return deserializeRoot(reader.subReader(length), options);
}
