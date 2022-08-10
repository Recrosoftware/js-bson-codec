import * as constants from "../../../constants.ts";
import {
  BsonObject,
  BsonSerializableCodeWithScope,
} from "../../../constants.ts";
import { BSONError } from "../../../error.ts";
import { Writer } from "../../../utils/simple-buffer.ts";
import { isValidBsonSerializableCodeWithScope } from "../../../utils/validations.ts";
import {
  UINT32_SIZE,
  writeString,
  writeTypeAndKey,
  writeUInt32,
} from "../../_utils.ts";
import { serialize as serializeRoot } from "../../serialize.ts";

export function serialize(
  writer: Writer,
  key: string,
  ser: BsonSerializableCodeWithScope,
): void {
  if (!isValidBsonSerializableCodeWithScope(ser)) {
    throw new BSONError(`Invalid CodeWithScope serializable value`);
  }

  const code: string = ser[1];
  const scope: BsonObject = ser[2];

  writeTypeAndKey(writer, constants.TYPE_CODE_WITH_SCOPE, key);

  const startPosition = writer.position;
  writer.seek(UINT32_SIZE);
  writeString(writer, code);
  serializeRoot(writer, scope);
  const endPosition = writer.position;

  const contentSize = endPosition - startPosition;
  writeUInt32(writer, contentSize + UINT32_SIZE, startPosition);
}
