import * as constants from '../../../constants.ts';
import {BsonSerializableRegularExpression} from '../../../constants.ts';
import {Reader} from '../../../utils/simple-buffer.ts';
import {readCString, readTypeAndKey} from '../../_utils.ts';


export function deserialize(reader: Reader): BsonSerializableRegularExpression {
  const [type] = readTypeAndKey(reader);

  if (type !== constants.TYPE_REGULAR_EXPRESSION) throw new Error(''); // TODO

  const [source] = readCString(reader);
  const [flags] = readCString(reader);

  return ['reg-exp', source, flags];
}
