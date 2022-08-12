import * as constants from '../../../constants.ts';
import {BsonSerializableCodeWithScope} from '../../../constants.ts';
import {Reader} from '../../../utils/simple-buffer.ts';
import {readString, readTypeAndKey, readUInt32} from '../../_utils.ts';


export function deserialize(reader: Reader): BsonSerializableCodeWithScope {
  const [type] = readTypeAndKey(reader);

  if (type !== constants.TYPE_CODE) throw new Error(''); // TODO

  const [length, lengthSize] = readUInt32(reader);
  const [code, codeSize] = readString(reader);

  const scopeReader = reader.subReader(length - (lengthSize + codeSize));
  // TODO: Deserialize using docReader

  // return ['code-with-scope', code, scope];
  throw new Error('TODO'); // TODO
}
