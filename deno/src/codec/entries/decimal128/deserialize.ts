import { DecimalDefinition } from "https://deno.land/x/parse_decimal@1.0.2/mod.ts";
import * as constants from "../../../constants.ts";
import { Reader } from "../../../utils/simple-buffer.ts";
import { readFloat128, readTypeAndKey } from "../../_utils.ts";

export function deserialize(reader: Reader): DecimalDefinition {
  const [type] = readTypeAndKey(reader);

  if (type !== constants.TYPE_DECIMAL128) throw new Error(""); // TODO

  const [value] = readFloat128(reader);

  return value;
}
