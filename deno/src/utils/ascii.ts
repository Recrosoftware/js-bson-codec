export function asciiToBuffer(str: string): Uint8Array {
  const buf = new Uint8Array(str.length);
  for (let i = 0; i < str.length; ++i) {
    buf[i] = str.charCodeAt(i);
  }
  return buf;
}

export function bufferToAscii(buf: Uint8Array): string {
  let str = "";
  for (let i = 0; i < buf.length; ++i) {
    str += String.fromCharCode(buf[i]);
  }
  return str;
}
