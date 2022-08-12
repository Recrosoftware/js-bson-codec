import * as constants from '../../../constants.ts';
import {BsonSerializableBinary} from '../../../constants.ts';
import {Reader} from '../../../utils/simple-buffer.ts';
import {isBsonBinarySubType} from '../../../utils/validations.ts';
import {readTypeAndKey, readUInt32, readUint8} from '../../_utils.ts';


export function deserialize(reader: Reader): BsonSerializableBinary {
  const [type] = readTypeAndKey(reader);

  if (type !== constants.TYPE_BINARY_DATA) throw new Error(''); // TODO

  const [dataLength] = readUInt32(reader);
  const [subType] = readUint8(reader);
  const data = reader.read(dataLength);

  if (!isBsonBinarySubType(subType)) throw new Error(''); // TODO

  return ['binary', subType, data];
}
