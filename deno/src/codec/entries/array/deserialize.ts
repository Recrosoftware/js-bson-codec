import * as constants from "../../../constants.ts";
import { Reader } from "../../../utils/simple-buffer.ts";
import { readInt32, readTypeAndKey } from "../../_utils.ts";
import { deserializeEntries as deserializeRootEntries } from "../../deserialize.ts";
import { DeserializeOptions } from "../../options.ts";

export function deserialize(
  reader: Reader,
  options?: DeserializeOptions,
): unknown[] {
  const [type] = readTypeAndKey(reader);

  if (type !== constants.TYPE_EMBEDDED_ARRAY) throw new Error(""); // TODO

  const [length] = readInt32(reader, true);
  if (length < 0) throw new Error(""); // TODO

  const entries = deserializeRootEntries(reader.subReader(length), options);

  const output: unknown[] = [];
  for (let i = 0; i < entries.length; ++i) {
    const expectedKey = String(i);
    const [key, value] = entries[i];

    if (key !== expectedKey) throw new Error(""); // TODO
    output.push(value);
  }
  return output;
}
