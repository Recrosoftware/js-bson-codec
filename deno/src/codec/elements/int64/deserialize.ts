import * as constants from '../../../constants.ts';
import {BsonSerializableInt64} from '../../../constants.ts';
import {Reader} from '../../../utils/simple-buffer.ts';
import {readInt64, readTypeAndKey} from '../../_utils.ts';


export function deserialize(reader: Reader): BsonSerializableInt64 {
  const [type] = readTypeAndKey(reader);

  if (type !== constants.TYPE_INT64) throw new Error(''); // TODO

  const [value] = readInt64(reader);

  return ['int64', value];
}
