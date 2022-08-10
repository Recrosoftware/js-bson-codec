import { BsonType } from "../constants.ts";
import { BSONError } from "../error.ts";
import {
  BinarySequence,
  getLength,
  isBinarySequence,
} from "../utils/binary-sequence.ts";
import { Writer } from "../utils/simple-buffer.ts";

const zeroChecker = /\x00/;
const encoder = new TextEncoder();

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
const MAX_UINT32_B = (2n ** 32n) - 1n;

const MIN_INT32_N = -(2 ** 31);
const MAX_INT32_N = (2 ** 31) - 1;
const MAX_UINT32_N = (2 ** 32) - 1;

const MIN_INT64 = -(2n ** 63n);
const MAX_INT64 = (2n ** 63n) - 1n;
const MAX_UINT64 = (2n ** 64n) - 1n;

const BYTE_MASK_B = 0xFFn;
const BYTE_MASK_N = 0xFF;

export type SerializableNumber = number | bigint | BinarySequence;

function isSerializableNumber(input: unknown): input is SerializableNumber {
  return typeof input === "number" || typeof input === "bigint" ||
    isBinarySequence(input);
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

export function writeUInt32(
  writer: Writer,
  value: SerializableNumber,
  index?: number,
): number {
  if (!isSerializableNumber(value)) {
    throw new Error(`The given value is not a serializable number`);
  }

  if (isBinarySequence(value)) {
    if (getLength(value) !== UINT32_SIZE) {
      throw new Error(`Invalid uint32 binary length`);
    }
    return writer.write(value, index);
  }

  if (typeof value === "number") {
    if (!Number.isInteger(value)) {
      throw new Error(`Can't serialize a non integer value to uint32`);
    }
    if (value < 0 || value > MAX_UINT32_N) {
      throw new Error(`Given value '${value}' exceeds uint32 range`);
    }
  } else {
    if (value < 0n || value > MAX_UINT32_B) {
      throw new Error(`Given value '${value}' exceeds uint32 range`);
    }
    value = Number(value);
  }

  bufView.setUint32(0, value, true);
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

  return writeUInt32(writer, content.length, index) +
    writer.write(content, index == null ? void 0 : index + UINT32_SIZE);
}

export function writeTypeAndKey(
  writer: Writer,
  type: BsonType,
  key: string,
  index?: number,
): number {
  return writeUInt8(writer, type, index) +
    writeCString(writer, key, index == null ? void 0 : index + UINT8_SIZE);
}
