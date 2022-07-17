import {DecimalDefinition, definitionToString, parseDecimalValue} from '../utils/numbers.ts';


function computeParameters(bits: number) {
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

  let wMask = 0n;
  for (let i = 0; i < w; ++i) wMask |= 1n << BigInt(i);

  let tMask = 0n;
  for (let i = 0; i < t; ++i) tMask |= 1n << BigInt(i);

  return {
    k, p, w, t,
    eMax, eMin, eBias,
    wMask, tMask
  };
}

export function encodeDecimal32(value: number | bigint | string, options?: { littleEndian?: boolean }): Uint8Array {
  return encodeDecimal(32, value, options);
}

export function encodeDecimal64(value: number | bigint | string, options?: { littleEndian?: boolean }): Uint8Array {
  return encodeDecimal(64, value, options);
}

export function encodeDecimal128(value: number | bigint | string, options?: { littleEndian?: boolean }): Uint8Array {
  return encodeDecimal(128, value, options);
}

export function encodeDecimal(bits: number, value: number | bigint | string, options?: { littleEndian?: boolean }): Uint8Array {
  const littleEndian = !!options?.littleEndian;

  const {
    k, p, w, t,
    eMax, eMin, eBias,
    wMask, tMask
  } = computeParameters(bits);
  const definition = parseDecimalValue(value);

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
        throw `Exponent too big`; // TODO: Throw error invalid precision
      }
      if (definition.exponent < eMin) {
        throw `Exponent too small`; // TODO: Throw error invalid precision
      }

      const combination = (definition.exponent + eBias) & wMask;
      encoded |= combination << BigInt(t);

      const significand = definition.digits & tMask;
      encoded |= significand;
    } else {
      encoded |= 0b11110n << BigInt(w + t);
    }
  }

  const bytes = bits / 8;
  const buffer = new Uint8Array(bytes);

  for (let encodedIndex = 0; encodedIndex < bytes; ++encodedIndex) {
    const bufferIndex = littleEndian ? encodedIndex : (bytes - (encodedIndex + 1));
    buffer[bufferIndex] = Number((encoded >> BigInt(encodedIndex * 8)) & 0xFFn);
  }

  return buffer;
}


export function decodeDecimal(bits: number, buffer: Uint8Array, options?: { offset?: number, littleEndian?: boolean }): string;
export function decodeDecimal<T>(bits: number, buffer: Uint8Array, options: { decoder: (def: DecimalDefinition) => T, offset?: number, littleEndian?: boolean }): T;
export function decodeDecimal<T>(bits: number, buffer: Uint8Array, options?: { decoder?: (def: DecimalDefinition) => T, offset?: number, littleEndian?: boolean }): string | T {
  const offset = options?.offset ?? 0;
  const littleEndian = !!options?.littleEndian;
  const decoder = options?.decoder || definitionToString;

  if (typeof offset !== 'number' || offset < 0 || !Number.isInteger(offset)) {
    throw `Invalid offset`; // TODO: throw message
  }
  if (typeof decoder !== 'function') {
    throw `Invalid decoder`; // TODO: throw message
  }

  const bytes = bits / 8;
  if (buffer.length < offset + bytes) {
    throw `Invalid buffer`; // TODO: throw message
  }

  const {
    k, w, t,
    eBias,
    wMask, tMask
  } = computeParameters(bits);

  let encoded = 0n;

  for (let bufferIndex = 0; bufferIndex < bytes; ++bufferIndex) {
    const encodedIndex = littleEndian ? bufferIndex : (bytes - (bufferIndex + 1));
    buffer[bufferIndex] = Number((encoded << BigInt(encodedIndex * 8)) & 0xFFn);
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

  return decoder(definition);
};















