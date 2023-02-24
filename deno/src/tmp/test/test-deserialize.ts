import { deserialize } from "../codec/deserialize.ts";
import { SimpleBufferReader } from "../utils/simple-buffer.ts";


const buffer = new Uint8Array([
    12, 0, 0, 0, 16, 97, 0, 32, 0, 0, 0, 0
]);
console.log('buffer', buffer);

const r = new SimpleBufferReader(buffer);
const output = deserialize(r, { converters: { convertCode: c => ['function', c] } });
console.log('output', output);