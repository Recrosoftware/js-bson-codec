import * as constants from '../../../constants.ts';
import {BsonSerializableMaxKey} from '../../../constants.ts';
import {Reader} from '../../../utils/simple-buffer.ts';
import {readTypeAndKey} from '../../_utils.ts';


export function deserialize(reader: Reader): BsonSerializableMaxKey {
  const [type] = readTypeAndKey(reader);

  if (type !== constants.TYPE_MAX_KEY) throw new Error(''); // TODO

  return ['max-key'];
}
