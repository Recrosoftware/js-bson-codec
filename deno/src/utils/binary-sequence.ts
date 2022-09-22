export type BinarySequence = ArrayBuffer | IndexedBinarySequence;
export type IndexedBinarySequence = Uint8Array | number[];

export function isBinarySequence(input: unknown): input is BinarySequence {
  return isIndexedBinarySequence(input) || input instanceof ArrayBuffer;
}

export function isIndexedBinarySequence(
  input: unknown,
): input is IndexedBinarySequence {
  return input instanceof Uint8Array || (
    Array.isArray(input) &&
    input.every((i) =>
      typeof i === "number" && i >= 0x00 && i <= 0xFF && Number.isInteger(i)
    )
  );
}

export function asIndexedBinarySequence(
  input: BinarySequence,
): IndexedBinarySequence {
  return input instanceof ArrayBuffer ? new Uint8Array(input) : input;
}

export function getLength(input: BinarySequence): number {
  return isIndexedBinarySequence(input) ? input.length : input.byteLength;
}

export function sameContent(a?: BinarySequence, b?: BinarySequence): boolean {
  if (!isBinarySequence(a) || !isBinarySequence(b)) return false;
  if (getLength(a) !== getLength(b)) return false;

  const indexedA = asIndexedBinarySequence(a);
  const indexedB = asIndexedBinarySequence(b);

  for (let i = 0; i < indexedA.length; ++i) {
    if (indexedA[i] !== indexedB[i]) return false;
  }

  return true;
}
