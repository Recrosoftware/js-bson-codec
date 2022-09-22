import * as constants from "../../../constants.ts";
import { Reader } from "../../../utils/simple-buffer.ts";
import { readInt32, readString, readTypeAndKey } from "../../_utils.ts";
import { deserialize as deserializeRoot } from "../../deserialize.ts";
import { DeserializeOptions } from "../../options.ts";

export function deserialize(
  reader: Reader,
  options?: DeserializeOptions,
): [string, Record<string, unknown>] {
  const [type] = readTypeAndKey(reader);

  if (type !== constants.TYPE_CODE_WITH_SCOPE) throw new Error(""); // TODO

  const [length, lengthSize] = readInt32(reader);
  if (length < 0) throw new Error(""); // TODO

  const [code, codeSize] = readString(reader);
  const scope = deserializeRoot(
    reader.subReader(length - (lengthSize + codeSize)),
    options,
  );

  return [code, scope];
}
