import { asciiToBuffer } from "./ascii.ts";

const base64abc: string = [
  "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  "abcdefghijklmnopqrstuvwxyz",
  "0123456789+/",
].join("");

export function bufferToBase64(data: Uint8Array | ArrayBuffer): string {
  const buf = data instanceof ArrayBuffer ? new Uint8Array(data) : data;

  let result = "", i: number;
  const l = buf.length;
  for (i = 2; i < l; i += 3) {
    result += base64abc[buf[i - 2] >> 2];
    result += base64abc[((buf[i - 2] & 0x03) << 4) | (buf[i - 1] >> 4)];
    result += base64abc[((buf[i - 1] & 0x0f) << 2) | (buf[i] >> 6)];
    result += base64abc[buf[i] & 0x3f];
  }
  if (i === l + 1) {
    // 1 octet yet to write
    result += base64abc[buf[i - 2] >> 2];
    result += base64abc[(buf[i - 2] & 0x03) << 4];
    result += "==";
  }
  if (i === l) {
    // 2 octets yet to write
    result += base64abc[buf[i - 2] >> 2];
    result += base64abc[((buf[i - 2] & 0x03) << 4) | (buf[i - 1] >> 4)];
    result += base64abc[(buf[i - 1] & 0x0f) << 2];
    result += "=";
  }
  return result;
}

export function base64ToBuffer(b64: string): Uint8Array {
  return asciiToBuffer(atob(b64));
}
