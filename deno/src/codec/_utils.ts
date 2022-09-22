import { DecimalDefinition } from "https://deno.land/x/parse_decimal@1.0.2/mod.ts";
import { BSONError } from "../error.ts";
import {
  BinarySequence,
  getLength,
  isBinarySequence,
} from "../utils/binary-sequence.ts";
import { Reader, Writer } from "../utils/simple-buffer.ts";

// deno-lint-ignore no-control-regex
const zeroChecker = /\x00/;
const encoder = new TextEncoder();
const decoder = new TextDecoder();

export const UINT8_SIZE = Uint8Array.BYTES_PER_ELEMENT;
export const UINT32_SIZE = Uint32Array.BYTES_PER_ELEMENT;
export const UINT64_SIZE = UINT32_SIZE * 2;
export const UINT128_SIZE = UINT64_SIZE * 2;

const sharedBuffer = new ArrayBuffer(Math.max(
  UINT8_SIZE,
  UINT32_SIZE,
  UINT64_SIZE,
  UINT128_SIZE,
));

const buf8 = new Uint8Array(sharedBuffer, 0, UINT8_SIZE);
const buf32 = new Uint8Array(sharedBuffer, 0, UINT32_SIZE);
const buf64 = new Uint8Array(sharedBuffer, 0, UINT64_SIZE);
const buf128 = new Uint8Array(sharedBuffer, 0, UINT128_SIZE);
const bufView = new DataView(sharedBuffer);

const MIN_INT32_B = -(2n ** 31n);
const MAX_INT32_B = (2n ** 31n) - 1n;

const MIN_INT32_N = -(2 ** 31);
const MAX_INT32_N = (2 ** 31) - 1;

const MIN_INT64 = -(2n ** 63n);
const MAX_INT64 = (2n ** 63n) - 1n;
const MAX_UINT64 = (2n ** 64n) - 1n;

const BYTE_MASK_B = 0xFFn;
const BYTE_MASK_N = 0xFF;

export type SerializableNumber = number | bigint | BinarySequence;

function isValidUTF8(content: Uint8Array): boolean {
  let continuation = 0;
  for (let i = 0; i < content.length; ++i) {
    const byte = content[i];

    if ((byte & 0b10000000) === 0) continue;
    if ((byte & 0b11000000) === 0b10000000) {
      if (--continuation < 0) return false;
      continue;
    }
    if (continuation !== 0) return false;

    if ((byte & 0b11100000) === 0b11000000) continuation = 1;
    else if ((byte & 0b11110000) === 0b11100000) continuation = 2;
    else if ((byte & 0b11111000) === 0b11110000) continuation = 3;
    else return false;
  }
  return continuation === 0;
}

function isSerializableNumber(input: unknown): input is SerializableNumber {
  return typeof input === "number" || typeof input === "bigint" ||
    isBinarySequence(input);
}

export function readUint8(
  reader: Reader,
  noSeek?: boolean,
): [value: number, size: number] {
  buf8.set(reader.read(UINT8_SIZE, noSeek));
  return [bufView.getUint8(0), UINT8_SIZE];
}

export function readInt32(
  reader: Reader,
  noSeek?: boolean,
): [value: number, size: number] {
  buf32.set(reader.read(UINT32_SIZE, noSeek));
  return [bufView.getInt32(0, true), UINT32_SIZE];
}

export function readInt64(
  reader: Reader,
  noSeek?: boolean,
): [value: bigint, size: number] {
  buf64.set(reader.read(UINT64_SIZE, noSeek));
  return [bufView.getBigInt64(0, true), UINT64_SIZE];
}

export function readUInt64(
  reader: Reader,
  noSeek?: boolean,
): [value: bigint, size: number] {
  buf64.set(reader.read(UINT64_SIZE, noSeek));
  return [bufView.getBigUint64(0, true), UINT64_SIZE];
}

export function readFloat64(
  reader: Reader,
  noSeek?: boolean,
): [value: number, size: number] {
  buf64.set(reader.read(UINT64_SIZE, noSeek));
  return [bufView.getFloat64(0, true), UINT64_SIZE];
}

export function readFloat128(
  reader: Reader,
  noSeek?: boolean,
): [value: DecimalDefinition, size: number] {
  buf128.set(reader.read(UINT128_SIZE, noSeek));
  throw new Error("TODO"); // TODO
}

export function readCString(
  reader: Reader,
  noSeek?: boolean,
): [value: string, size: number] {
  let buf = reader.readUntil((b) => b === 0x00, noSeek);
  const stringLength = buf.length;

  buf = buf.subarray(0, buf.length - 1);
  if (!isValidUTF8(buf)) throw new Error(""); // TODO

  return [decoder.decode(buf), stringLength];
}

export function readString(
  reader: Reader,
  noSeek?: boolean,
): [value: string, size: number] {
  const [stringLength, stringLengthSize] = readInt32(reader, noSeek);
  if (stringLength < 0) throw new Error(""); // TODO

  if (noSeek) reader.seek(stringLengthSize);
  let buf = reader.read(stringLength, noSeek);
  if (buf[buf.length - 1] !== 0x00) throw new Error(""); // TODO: message and error type
  buf = buf.subarray(0, buf.length - 1);
  if (noSeek) reader.seek(-stringLengthSize);

  if (!isValidUTF8(buf)) throw new Error(""); // TODO

  return [decoder.decode(buf), stringLengthSize + stringLength];
}

export function readTypeAndKey(
  reader: Reader,
  noSeek?: boolean,
): [type: number, key: string, size: number] {
  const [type, typeSize] = readUint8(reader, noSeek);

  if (noSeek) reader.seek(typeSize);
  const [key, keySize] = readCString(reader, noSeek);
  if (noSeek) reader.seek(-typeSize);

  return [type, key, typeSize + keySize];
}

export function writeUInt8(
  writer: Writer,
  value: SerializableNumber,
  index?: number,
): number {
  if (!isSerializableNumber(value)) {
    throw new Error(`The given value is not a serializable number`);
  }

  if (isBinarySequence(value)) {
    if (getLength(value) !== UINT8_SIZE) {
      throw new Error(`Invalid uint8 binary length`);
    }
    return writer.write(value, index);
  }

  if (typeof value === "number") {
    if (!Number.isInteger(value)) {
      throw new Error(`Can't serialize a non integer value to uint8`);
    }
    if (value < 0 || value > BYTE_MASK_N) {
      throw new Error(`Given value '${value}' exceeds uint8 range`);
    }
  } else {
    if (value < 0n || value > BYTE_MASK_B) {
      throw new Error(`Given value '${value}' exceeds uint8 range`);
    }
    value = Number(value);
  }

  bufView.setUint8(0, value);
  return writer.write(buf8, index);
}

export function writeInt32(
  writer: Writer,
  value: SerializableNumber,
  index?: number,
): number {
  if (!isSerializableNumber(value)) {
    throw new Error(`The given value is not a serializable number`);
  }

  if (isBinarySequence(value)) {
    if (getLength(value) !== UINT32_SIZE) {
      throw new Error(`Invalid int32 binary length`);
    }
    return writer.write(value, index);
  }

  if (typeof value === "number") {
    if (!Number.isInteger(value)) {
      throw new Error(`Can't serialize a non integer value to int32`);
    }
    if (value < MIN_INT32_N || value > MAX_INT32_N) {
      throw new Error(`Given value '${value}' exceeds int32 range`);
    }
  } else {
    if (value < MIN_INT32_B || value > MAX_INT32_B) {
      throw new Error(`Given value '${value}' exceeds int32 range`);
    }
    value = Number(value);
  }

  bufView.setInt32(0, value, true);
  return writer.write(buf32, index);
}

export function writeInt64(
  writer: Writer,
  value: SerializableNumber,
  index?: number,
): number {
  if (!isSerializableNumber(value)) {
    throw new Error(`The given value is not a serializable number`);
  }

  if (isBinarySequence(value)) {
    if (getLength(value) !== UINT64_SIZE) {
      throw new Error(`Invalid int64 binary length`);
    }
    return writer.write(value, index);
  }

  if (typeof value === "number") {
    if (!Number.isInteger(value)) {
      throw new Error(`Can't serialize a non integer value to int64`);
    }
    value = BigInt(value);
  }
  if (value < MIN_INT64 || value > MAX_INT64) {
    throw new Error(`Given value '${value}' exceeds int64 range`);
  }

  bufView.setBigInt64(0, value, true);
  return writer.write(buf64, index);
}

export function writeUInt64(
  writer: Writer,
  value: SerializableNumber,
  index?: number,
): number {
  if (!isSerializableNumber(value)) {
    throw new Error(`The given value is not a serializable number`);
  }

  if (isBinarySequence(value)) {
    if (getLength(value) !== UINT64_SIZE) {
      throw new Error(`Invalid uint64 binary length`);
    }
    return writer.write(value, index);
  }

  if (typeof value === "number") {
    if (!Number.isInteger(value)) {
      throw new Error(`Can't serialize a non integer value to uint64`);
    }
    value = BigInt(value);
  }
  if (value < 0n || value > MAX_UINT64) {
    throw new Error(`Given value ${value} exceeds uint64 range`);
  }

  bufView.setBigUint64(0, value, true);
  return writer.write(buf64, index);
}

export function writeFloat64(
  writer: Writer,
  value: SerializableNumber,
  index?: number,
): number {
  if (!isSerializableNumber(value)) {
    throw new Error(`The given value is not a serializable number`);
  }

  if (isBinarySequence(value)) {
    if (getLength(value) !== 8) {
      throw new Error(`Invalid float64 binary length`);
    }
    return writer.write(value, index);
  }

  if (typeof value === "bigint") value = Number(value);

  bufView.setFloat64(0, value, true);
  return writer.write(buf64, index);
}

export function writeFloat128(
  writer: Writer,
  value: SerializableNumber,
  index?: number,
): number {
  if (!isSerializableNumber(value)) {
    throw new Error(`The given value is not a serializable number`);
  }

  if (isBinarySequence(value)) {
    if (getLength(value) !== 16) {
      throw new Error(`Invalid decimal128 binary length`);
    }
    return writer.write(value, index);
  }

  buf128.fill(0); // TODO

  return writer.write(buf128, index);
}

export function writeCString(
  writer: Writer,
  str: string,
  index?: number,
): number {
  if (zeroChecker.test(str)) {
    throw new BSONError(`Not a valid CString '${str}'`);
  }

  return writer.write(encoder.encode(str + `\x00`), index);
}

export function writeString(
  writer: Writer,
  str: string,
  index?: number,
): number {
  const content = encoder.encode(str + `\x00`);

  const lengthSize = writeInt32(writer, content.length, index);
  return lengthSize +
    writer.write(content, index == null ? void 0 : index + lengthSize);
}

export function writeTypeAndKey(
  writer: Writer,
  type: number,
  key: string,
  index?: number,
): number {
  const typeSize = writeUInt8(writer, type, index);
  return typeSize +
    writeCString(writer, key, index == null ? void 0 : index + typeSize);
}
