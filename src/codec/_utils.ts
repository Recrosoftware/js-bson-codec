import {Writer} from '../buffer.ts';
import {BsonType} from '../constants.ts';
import {BSONError} from '../error.ts';
import {encodeDecimal128, encodeDecimal64} from '../test/ieee754.ts';


const zeroChecker = /\x00/;

const encoder = new TextEncoder();

const sharedBuffer = new ArrayBuffer(16);
const bufferView = new DataView(sharedBuffer);

export const UINT8_SIZE = Uint8Array.BYTES_PER_ELEMENT;
export const UINT32_SIZE = Uint32Array.BYTES_PER_ELEMENT;
export const UINT64_SIZE = UINT32_SIZE * 2;
export const UINT128_SIZE = UINT64_SIZE * 2;

const MIN_INT32 = -(2n ** 31n);
const MAX_INT32 = (2n ** 31n) - 1n;

const MAX_UINT32 = (2n ** 32n) - 1n;

const MIN_INT64 = -(2n ** 63n);
const MAX_INT64 = (2n ** 63n) - 1n;

const MAX_UINT64 = (2n ** 64n) - 1n;

const BIG_BYTE_MASK = 0xFFn;

const buf8 = new Uint8Array(sharedBuffer, 0, UINT8_SIZE);
const buf32 = new Uint8Array(sharedBuffer, 0, UINT32_SIZE);
const buf64 = new Uint8Array(sharedBuffer, 0, UINT64_SIZE);
const buf128 = new Uint8Array(sharedBuffer, 0, UINT128_SIZE);

function isSerializableNumber(input: unknown): input is number | bigint | Uint8Array {
  return typeof input === 'number' || typeof input === 'bigint' || input instanceof Uint8Array;
}

export function writeUInt8(writer: Writer, value: number | bigint | Uint8Array, index?: number): number {
  if (!isSerializableNumber(value)) throw new Error(`The given value is not a serializable number`);

  if (value instanceof Uint8Array) {
    if (value.length !== 1) throw new Error(`Invalid uint8 binary length`);
    return writer.write(value);
  }

  if (typeof value === 'number') {
    if (!Number.isInteger(value)) throw new Error(`Can't serialize a non integer value to uint8`);
    if (value < 0 || value > 0xFF) throw new Error(`Given value '${value}' exceeds uint8 range`);

    buf8[0] = value;
  } else {
    if (value < 0n || value > 0xFFn) throw new Error(`Given value '${value}' exceeds uint8 range`);

    buf8[0] = Number(value);
  }

  return writer.write(buf8, index);
}

export function writeInt32(writer: Writer, value: number | bigint | Uint8Array, index?: number): number {
  if (!isSerializableNumber(value)) throw new Error(`The given value is not a serializable number`);

  if (value instanceof Uint8Array) {
    if (value.length !== 4) throw new Error(`Invalid int32 binary length`);
    return writer.write(value);
  }

  if (typeof value === 'number') {
    if (!Number.isInteger(value)) throw new Error(`Can't serialize a non integer value to int32`);
    value = BigInt(value);
  }

  if (value < MIN_INT32 || value > MAX_INT32) throw new Error(`Given value ${value} exceeds int32 range`);

  buf32[0] = Number(value & BIG_BYTE_MASK);
  buf32[1] = Number((value >> 8n) & BIG_BYTE_MASK);
  buf32[2] = Number((value >> 16n) & BIG_BYTE_MASK);
  buf32[3] = Number((value >> 24n) & BIG_BYTE_MASK);
  return writer.write(buf32, index);
}

export function writeUInt32(writer: Writer, value: number | bigint | Uint8Array, index?: number): number {
  if (!isSerializableNumber(value)) throw new Error(`The given value is not a serializable number`);

  if (value instanceof Uint8Array) {
    if (value.length !== 4) throw new Error(`Invalid uint32 binary length`);
    return writer.write(value);
  }

  if (typeof value === 'number') {
    if (!Number.isInteger(value)) throw new Error(`Can't serialize a non integer value to uint32`);
    value = BigInt(value);
  }

  if (value < 0 || value > MAX_UINT32) throw new Error(`Given value ${value} exceeds uint32 range`);

  buf32[0] = Number(value & BIG_BYTE_MASK);
  buf32[1] = Number((value >> 8n) & BIG_BYTE_MASK);
  buf32[2] = Number((value >> 16n) & BIG_BYTE_MASK);
  buf32[3] = Number((value >> 24n) & BIG_BYTE_MASK);
  return writer.write(buf32, index);
}

export function writeInt64(writer: Writer, value: number | bigint | Uint8Array, index?: number): number {
  if (!isSerializableNumber(value)) throw new Error(`The given value is not a serializable number`);

  if (value instanceof Uint8Array) {
    if (value.length !== 8) throw new Error(`Invalid int64 binary length`);
    return writer.write(value, index);
  }

  if (typeof value === 'number') {
    if (!Number.isInteger(value)) throw new Error(`Can't serialize a non integer value to int64`);
    value = BigInt(value);
  }

  if (value < MIN_INT64 || value > MAX_INT64) throw new Error(`Given value ${value} exceeds int64 range`);

  buf64[0] = Number(value & BIG_BYTE_MASK);
  buf64[1] = Number((value >> 8n) & BIG_BYTE_MASK);
  buf64[2] = Number((value >> 16n) & BIG_BYTE_MASK);
  buf64[3] = Number((value >> 24n) & BIG_BYTE_MASK);
  buf64[4] = Number((value >> 32n) & BIG_BYTE_MASK);
  buf64[5] = Number((value >> 40n) & BIG_BYTE_MASK);
  buf64[6] = Number((value >> 48n) & BIG_BYTE_MASK);
  buf64[7] = Number((value >> 56n) & BIG_BYTE_MASK);

  return writer.write(buf64, index);
}

export function writeUInt64(writer: Writer, value: number | bigint | Uint8Array, index?: number): number {
  if (!isSerializableNumber(value)) throw new Error(`The given value is not a serializable number`);

  if (value instanceof Uint8Array) {
    if (value.length !== 8) throw new Error(`Invalid uint64 binary length`);
    return writer.write(value);
  }


  if (typeof value === 'number') {
    if (!Number.isInteger(value)) throw new Error(`Can't serialize a non integer value to uint64`);
    value = BigInt(value);
  }

  if (value < 0n || value > MAX_UINT64) throw new Error(`Given value ${value} exceeds uint64 range`);

  buf64[0] = Number(value & BIG_BYTE_MASK);
  buf64[1] = Number((value >> 8n) & BIG_BYTE_MASK);
  buf64[2] = Number((value >> 16n) & BIG_BYTE_MASK);
  buf64[3] = Number((value >> 24n) & BIG_BYTE_MASK);
  buf64[4] = Number((value >> 32n) & BIG_BYTE_MASK);
  buf64[5] = Number((value >> 40n) & BIG_BYTE_MASK);
  buf64[6] = Number((value >> 48n) & BIG_BYTE_MASK);
  buf64[7] = Number((value >> 56n) & BIG_BYTE_MASK);

  return writer.write(buf64, index);
}

export function writeFloat64(writer: Writer, value: number | bigint | Uint8Array, index?: number): number {
  if (!isSerializableNumber(value)) throw new Error(`The given value is not a serializable number`);

  if (value instanceof Uint8Array) {
    if (value.length !== 8) throw new Error(`Invalid float64 binary length`);
    return writer.write(value, index);
  }

  return writer.write(encodeDecimal64(value, {littleEndian: true}), index);
}

export function writeFloat128(writer: Writer, value: number | bigint | Uint8Array, index?: number): number {
  if (!isSerializableNumber(value)) throw new Error(`The given value is not a serializable number`);

  if (value instanceof Uint8Array) {
    if (value.length !== 16) throw new Error(`Invalid decimal128 binary length`);
    return writer.write(value);
  }

  return writer.write(encodeDecimal128(value, {littleEndian: true}), index);
}

export function writeCString(writer: Writer, str: string, index?: number): number {
  if (zeroChecker.test(str)) throw new BSONError(`Not a valid CString '${str}'`);

  return writer.write(encoder.encode(str + `\x00`), index);
}

export function writeString(writer: Writer, str: string, index?: number): number {
  const content = encoder.encode(str + `\x00`);

  return writeUInt32(writer, content.length, index) + writer.write(content, index == null ? void 0 : index + UINT32_SIZE);
}

export function writeTypeAndKey(writer: Writer, type: BsonType, key: string, index?: number): number {
  return writeUInt8(writer, type, index) + writeCString(writer, key, index == null ? void 0 : index + UINT8_SIZE);
}