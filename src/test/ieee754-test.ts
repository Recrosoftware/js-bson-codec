import {decodeDecimal, encodeDecimal} from './ieee754.ts';


const encoded = encodeDecimal(32, Deno.args[0] || '0', {littleEndian: true});
const decoded = decodeDecimal(32, encoded, {littleEndian: true, decoder: e => e});

const str: string[] = [];
for (let i = 0; i < encoded.length; ++i) {
  str.push(encoded[i].toString(2).padStart(8, '0'));
}
console.log();
console.log(str.join('_'));
console.log();

console.log(decoded);