import * as constants from '../../../constants.ts';
import {BsonSerializableUndefined} from '../../../constants.ts';
import {Reader} from '../../../utils/simple-buffer.ts';
import {readTypeAndKey} from '../../_utils.ts';


export function deserialize(reader: Reader): BsonSerializableUndefined {
  const [type] = readTypeAndKey(reader);

  if (type !== constants.TYPE_UNDEFINED) throw new Error(''); // TODO

  return ['undefined'];
}
