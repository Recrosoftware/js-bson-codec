import * as constants from '../../../constants.ts';
import {BsonSerializableInt32} from '../../../constants.ts';
import {Reader} from '../../../utils/simple-buffer.ts';
import {readInt32, readTypeAndKey} from '../../_utils.ts';


export function deserialize(reader: Reader): BsonSerializableInt32 {
  const [type] = readTypeAndKey(reader);

  if (type !== constants.TYPE_INT32) throw new Error(''); // TODO

  const [value] = readInt32(reader);

  return ['int32', value];
}
