import { deserialize } from "../codec/deserialize.ts";
import { serialize } from "../codec/serialize.ts";
import { SimpleBufferReader, SimpleBufferWriter } from "../utils/simple-buffer.ts";

const value = {
    abcde: 12,
    string: 'hello world ! ',
    a: [
        true, false, undefined, null
    ],
    b: {
        'hi': 123n
    },
    c: function () { return undefined; }
};

console.log('input', value);

const w = new SimpleBufferWriter();
serialize(w, value);

const buffer = w.getBuffer();
console.log('buffer', buffer.join(', '));

const r = new SimpleBufferReader(buffer);
const output = deserialize(r, { converters: { convertCode: c => ['function', c] } });
console.log('output', output);