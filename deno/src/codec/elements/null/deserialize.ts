import * as constants from '../../../constants.ts';
import {BsonSerializableNull} from '../../../constants.ts';
import {Reader} from '../../../utils/simple-buffer.ts';
import {readTypeAndKey} from '../../_utils.ts';


export function deserialize(reader: Reader): BsonSerializableNull {
  const [type] = readTypeAndKey(reader);

  if (type !== constants.TYPE_NULL) throw new Error(''); // TODO

  return ['null'];
}
