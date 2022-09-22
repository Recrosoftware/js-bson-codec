import * as constants from "../../../constants.ts";
import { Reader } from "../../../utils/simple-buffer.ts";
import { isBsonBinarySubType } from "../../../utils/validations.ts";
import { readInt32, readTypeAndKey, readUint8 } from "../../_utils.ts";

export function deserialize(reader: Reader): Uint8Array {
  const [type] = readTypeAndKey(reader);

  if (type !== constants.TYPE_BINARY_DATA) throw new Error(""); // TODO

  const [dataLength] = readInt32(reader);
  if (dataLength < 0) throw new Error(""); // TODO

  const [subType] = readUint8(reader);
  const data = reader.read(dataLength);

  if (!isBsonBinarySubType(subType)) throw new Error(""); // TODO

  return data;
}
