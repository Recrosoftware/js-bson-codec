const HEX_REGEXP = /^(?:[0-9A-F]{2})*$/i;

export function isValidHex(hex: string): boolean {
  return HEX_REGEXP.test(hex);
}

export function hexToBuffer(hex: string): Uint8Array {
  if (!isValidHex(hex)) throw new Error(`Invalid hex string '${hex}'`);

  const buf = new Uint8Array(hex.length * 2);
  for (let i = 0; i < hex.length; i += 2) {
    buf[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return buf;
}

export function bufferToHex(buf: Uint8Array) {
  let hex = '';
  for (let i = 0; i < buf.length; ++i) {
    hex += buf[i] < 0x10
      ? ('0' + buf[i].toString(16))
      : buf[i].toString(16);
  }
  return hex;
}