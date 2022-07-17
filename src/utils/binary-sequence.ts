export type BinarySequence = ArrayBuffer | IndexedBinarySequence;
export type IndexedBinarySequence = Uint8Array | number[];

export function isBinarySequence(input: unknown): input is BinarySequence {
  return isIndexedBinarySequence(input) || input instanceof ArrayBuffer;
}

export function isIndexedBinarySequence(input: unknown): input is IndexedBinarySequence {
  // TODO: Check array value better (check if is a number array of integers between 0x00 and 0xFF)
  return input instanceof Uint8Array || Array.isArray(input);
}

export function asIndexedBinarySequence(input: BinarySequence): IndexedBinarySequence {
  return input instanceof ArrayBuffer
    ? new Uint8Array(input)
    : input;
}

export function getLength(input: BinarySequence): number {
  return isIndexedBinarySequence(input)
    ? input.length
    : input.byteLength;
}

export function sameContent(a?: BinarySequence, b?: BinarySequence): boolean {
  if (!isBinarySequence(a) || !isBinarySequence(b)) return false;
  if (getLength(a) !== getLength(b)) return false;

  const indexedA = asIndexedBinarySequence(a);
  const indexedB = asIndexedBinarySequence(b);

  for (let i = 0; i < indexedA.length; ++i)
    if (indexedA[i] !== indexedB[i]) return false;

  return true;
}