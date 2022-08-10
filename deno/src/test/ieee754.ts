import type {DecimalDefinition} from 'https://deno.land/x/parse_decimal/mod.ts';
import {parseDecimal} from 'https://deno.land/x/parse_decimal/mod.ts';

import {stringifyDecimalDefinition} from '../utils/numbers.ts';


export type CodecOptions = {
  offset?: number;
  littleEndian?: boolean;
}

export type DecimalConverter<T> = {
  convert: (definition: DecimalDefinition) => T;
}

function computeEncodingParameters(bits: number) {
  if (typeof bits !== 'number' || !Number.isInteger(bits) || bits < 32 || (bits % 32) !== 0) {
    throw new Error(`Invalid bit size '${bits}', must be an integer multiple of 32`);
  }

  const k = bits; // storage width in bits
  const p = 9 * (k / 32) - 2; // precision in digits
  const w = k / 16 + 4; // combination field width in bits
  const t = 15 * k / 16 - 10; // trailing significand field width in bits

  const eMax = BigInt(3 * (2 ** (k / 16 + 3))); // max exponent
  const eMin = 1n - eMax; // min exponent
  const eBias = eMax + BigInt(p - 2); // E-q

  // Biased exponent mask
  let wMask = 0n;
  for (let i = 0; i < w + 2; ++i) wMask |= 1n << BigInt(i);

  // Significand mask
  let tMask = 0n;
  for (let i = 0; i < t; ++i) tMask |= 1n << BigInt(i);

  return {
    k, p, w, t,
    eMax, eMin, eBias,
    wMask, tMask
  };
}

export function encodeDecimal32(buffer: Uint8Array, value: number | bigint | string, options?: CodecOptions): Uint8Array {
  return encodeDecimal(32, buffer, value, options);
}

export function encodeDecimal64(buffer: Uint8Array, value: number | bigint | string, options?: CodecOptions): Uint8Array {
  return encodeDecimal(64, buffer, value, options);
}

export function encodeDecimal128(buffer: Uint8Array, value: number | bigint | string, options?: CodecOptions): Uint8Array {
  return encodeDecimal(128, buffer, value, options);
}

export function encodeDecimal(bits: number, buffer: Uint8Array, value: number | bigint | string, options?: CodecOptions): void {
  const littleEndian = !!options?.littleEndian;
  const offset = options?.offset ?? 0;

  if (typeof offset !== 'number' || !Number.isInteger(offset) || offset < 0) {
    throw 'Invalid offset'; // TODO
  }

  const {
    k, p, w, t,
    eMax, eMin, eBias,
    wMask, tMask
  } = computeEncodingParameters(bits);

  const bytes = bits / 8;
  if (buffer.length < offset + bytes) {
    throw 'Invalid buffer length'; // TODO
  }

  const definition = parseDecimal(value);

  // Encode decimal value to binary
  let encoded = 0n;

  if (definition.nan) {
    encoded |= 0b11111n << BigInt(w + t);
    if (definition.signaling) encoded |= 1n << BigInt(w + t - 1);
  } else {
    if (definition.negative) encoded |= 1n << BigInt(k - 1);

    if (definition.finite) {
      if (definition.digits >= 10n ** BigInt(p)) {
        throw `Too many digits`; // TODO: Throw error invalid precision
      }
      if (definition.exponent > eMax) {
        throw `Exponent too big, max: ${eMax}`; // TODO: Throw error invalid precision
      }
      if (definition.exponent < eMin) {
        throw `Exponent too small, min: ${eMin}`; // TODO: Throw error invalid precision
      }

      const combination = (definition.exponent + eBias) & wMask;
      encoded |= combination << BigInt(t);

      const significand = definition.digits & tMask;
      encoded |= significand;
    } else {
      encoded |= 0b11110n << BigInt(w + t);
    }
  }

  for (let encodedIndex = 0; encodedIndex < bytes; ++encodedIndex) {
    const bufferIndex = littleEndian ? encodedIndex : (bytes - (encodedIndex + 1));
    buffer[bufferIndex + offset] = Number((encoded >> BigInt(encodedIndex * 8)) & 0xFFn);
  }
}

export function decodeDecimal32(buffer: Uint8Array, options?: CodecOptions): string;
export function decodeDecimal32<T>(buffer: Uint8Array, options: CodecOptions & DecimalConverter<T>): T;
export function decodeDecimal32<T>(buffer: Uint8Array, options?: CodecOptions & Partial<DecimalConverter<T>>): string | T {
  return decodeDecimal(32, buffer, options);
}

export function decodeDecimal64(buffer: Uint8Array, options?: CodecOptions): string;
export function decodeDecimal64<T>(buffer: Uint8Array, options: CodecOptions & DecimalConverter<T>): T;
export function decodeDecimal64<T>(buffer: Uint8Array, options?: CodecOptions & Partial<DecimalConverter<T>>): string | T {
  return decodeDecimal(64, buffer, options);
}

export function decodeDecimal128(buffer: Uint8Array, options?: CodecOptions): string;
export function decodeDecimal128<T>(buffer: Uint8Array, options: CodecOptions & DecimalConverter<T>): T;
export function decodeDecimal128<T>(buffer: Uint8Array, options?: CodecOptions & Partial<DecimalConverter<T>>): string | T {
  return decodeDecimal(128, buffer, options);
}

export function decodeDecimal(bits: number, buffer: Uint8Array, options?: CodecOptions): string;
export function decodeDecimal<T>(bits: number, buffer: Uint8Array, options: CodecOptions & DecimalConverter<T>): T;
export function decodeDecimal<T>(bits: number, buffer: Uint8Array, options?: CodecOptions & Partial<DecimalConverter<T>>): string | T {
  const offset = options?.offset ?? 0;
  const littleEndian = !!options?.littleEndian;
  const converter = options?.converter || stringifyDecimalDefinition;

  if (typeof offset !== 'number' || offset < 0 || !Number.isInteger(offset)) {
    throw `Invalid offset`; // TODO: throw message
  }
  if (typeof converter !== 'function') {
    throw `Invalid converter`; // TODO: throw message
  }

  const {
    k, w, t,
    eBias,
    wMask, tMask
  } = computeEncodingParameters(bits);

  const bytes = bits / 8;
  if (buffer.length < offset + bytes) {
    throw `Invalid buffer size`; // TODO: throw message
  }

  let encoded = 0n;
  for (let bufferIndex = 0; bufferIndex < bytes; ++bufferIndex) {
    const encodedIndex = littleEndian ? bufferIndex : (bytes - (bufferIndex + 1));
    encoded |= BigInt(buffer[bufferIndex]) << BigInt(encodedIndex * 8);
  }

  let definition: DecimalDefinition;

  const classification = (encoded >> BigInt(w + t)) & 0b11111n;

  if (classification === 0b11111) {
    const signaling = ((encoded >> BigInt(w + t - 1)) & 1n) === 1n;

    definition = {
      nan: true,
      signaling
    };
  } else {
    const negative = ((encoded >> BigInt(k - 1)) & 1n) === 1n;

    if (classification === 0b11110) {
      definition = {
        nan: false,

        finite: false,
        negative
      };
    } else {
      const combination = (encoded >> BigInt(t)) & wMask;
      const significand = encoded & tMask;

      const exponent = combination - eBias;

      definition = {
        nan: false,
        finite: true,
        negative,
        digits: significand,
        exponent
      };
    }
  }

  return converter(definition);
}
