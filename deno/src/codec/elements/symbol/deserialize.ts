import * as constants from '../../../constants.ts';
import {BsonSerializableSymbol} from '../../../constants.ts';
import {Reader} from '../../../utils/simple-buffer.ts';
import {readString, readTypeAndKey} from '../../_utils.ts';


export function deserialize(reader: Reader): BsonSerializableSymbol {
  const [type] = readTypeAndKey(reader);

  if (type !== constants.TYPE_SYMBOL) throw new Error(''); // TODO

  const [value] = readString(reader);

  return ['symbol', value];
}
