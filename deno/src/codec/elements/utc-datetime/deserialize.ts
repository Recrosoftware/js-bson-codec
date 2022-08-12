import * as constants from '../../../constants.ts';
import {BsonSerializableUtcDatetime} from '../../../constants.ts';
import {Reader} from '../../../utils/simple-buffer.ts';
import {readInt64, readTypeAndKey} from '../../_utils.ts';


export function deserialize(reader: Reader): BsonSerializableUtcDatetime {
  const [type] = readTypeAndKey(reader);

  if (type !== constants.TYPE_UTC_DATETIME) throw new Error(''); // TODO

  const [value] = readInt64(reader);

  return ['utc-datetime', value];
}
