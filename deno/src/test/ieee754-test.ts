import {parseDecimalValue, stringifyDecimalDefinition} from '../utils/numbers.ts';
import {decodeDecimal, encodeDecimal} from './ieee754.ts';


const input = Deno.args[0] || '0';

const parsed = parseDecimalValue(input);
const bits = 128;

console.log(`rawInput:`, input);
console.log(`Parsed:  `, parsed);
console.log(`Input:   `, stringifyDecimalDefinition(parsed));
console.log(`Bits:    `, bits);

const encoded = new Uint8Array(bits / 8);
encodeDecimal(bits, encoded, input, {littleEndian: true});
const decoded = decodeDecimal(bits, encoded, {littleEndian: true, converter: e => e});

const str: string[] = [];
for (let i = 0; i < encoded.length; ++i) {
  str.push(encoded[i].toString(2).padStart(8, '0'));
}

console.log(`Encoded: `, str.join('_'));
console.log(`Decoded: `, decoded);
console.log(`Output:  `, stringifyDecimalDefinition(decoded));