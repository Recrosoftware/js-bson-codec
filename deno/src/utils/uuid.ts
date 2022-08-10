import {asIndexedBinarySequence, BinarySequence, getLength, isBinarySequence} from './binary-sequence.ts';
import {bufferToHex, hexToBuffer} from './hex.ts';


export const UUID_BYTE_LENGTH = 16;
export const UUID_REGEXP =
  /^[0-9A-F]{8}(?:-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-|[0-9A-F]{4}4[0-9A-F]{3}[89AB][0-9A-F]{3})[0-9A-F]{12}/i;

export function uuidHexToBuffer(uuid: string): Uint8Array {
  if (!isValidUuid(uuid)) throw new Error(`Invalid uuid string: '${uuid}'`);

  return hexToBuffer(uuid.replaceAll('-', ''));
}

export function bufferToUuidHex(buf: Uint8Array, includeDashes = true): string {
  if (!isValidUuid(buf)) throw new Error(`Invalid uuid buffer`);

  const parts = [
    bufferToHex(buf.subarray(0, 4)),
    bufferToHex(buf.subarray(4, 6)),
    bufferToHex(buf.subarray(6, 8)),
    bufferToHex(buf.subarray(8, 10)),
    bufferToHex(buf.subarray(10, 16))
  ];

  return parts.join(includeDashes ? '-' : '');
}

export function isValidUuid(uuid: unknown): uuid is string | BinarySequence {
  return isValidUuidString(uuid) || isValidUuidBuffer(uuid);
}

export function isValidUuidString(uuid: unknown): uuid is string {
  return typeof uuid === 'string' && UUID_REGEXP.test(uuid);
}

export function isValidUuidBuffer(uuid: unknown): uuid is BinarySequence {
  if (!isBinarySequence(uuid)) return false;
  if (getLength(uuid) !== UUID_BYTE_LENGTH) return false;

  const buf = asIndexedBinarySequence(uuid);

  const version = Math.floor(buf[6] / 0x10);
  const check = Math.floor(buf[8] / 0x10);

  return version === 4 && check >= 0x8 && check <= 0xB;
}