import * as constants from '../../../constants.ts';
import {BsonSerializableDouble} from '../../../constants.ts';
import {Reader} from '../../../utils/simple-buffer.ts';
import {readFloat64, readTypeAndKey} from '../../_utils.ts';


export function deserialize(reader: Reader): BsonSerializableDouble {
  const [type] = readTypeAndKey(reader);

  if (type !== constants.TYPE_DOUBLE) throw new Error(''); // TODO

  const [value] = readFloat64(reader);

  return ['double', value];
}
