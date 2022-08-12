import {asIndexedBinarySequence, BinarySequence, getLength, isBinarySequence} from './binary-sequence.ts';


export interface Writer {
  position: number;

  seek(amount: number): void;

  write(buffer: BinarySequence, index?: number): number;
}

export interface Reader {
  position: number;

  ended(): boolean;

  seek(amount: number): void;

  read(bytes: number, noSeek?: boolean): Uint8Array;

  readUntil(readNext: (byte: number) => boolean, noSeek?: boolean): Uint8Array;

  subReader(bytes: number, noSeek?: boolean): Reader;
}

export const SIMPLE_BUFFER_MIN = 16;
export const SIMPLE_BUFFER_INITIAL_SIZE = 256;

export class SimpleBufferWriter implements Writer {
  get position(): number {
    return this.#position;
  }

  set position(position: number) {
    if (!Number.isInteger(position)) throw new Error(`Parameter must be an integer`);
    if (position < 0) throw new Error(`Cannot seek before the beginning of the buffer`);

    this.#position = position;
  }

  get growBufferSize(): number {
    return this.#growBufferSize;
  }

  set growBufferSize(value: number) {
    if (!Number.isInteger(value)) throw new Error(`Parameter must be an integer`);
    if (value < SIMPLE_BUFFER_MIN) value = SIMPLE_BUFFER_MIN;

    this.#growBufferSize = value;
  }

  #buffer: Uint8Array;

  #position: number;
  #growBufferSize: number;

  constructor(initialSize: number = SIMPLE_BUFFER_INITIAL_SIZE,
              growBufferSize: number = SIMPLE_BUFFER_INITIAL_SIZE) {

    if (!Number.isInteger(initialSize)) throw new Error(`Parameter 'initialSize' must be an integer`);
    if (!Number.isInteger(growBufferSize)) throw new Error(`Parameter 'growBufferSize' must be an integer`);

    if (initialSize < SIMPLE_BUFFER_MIN) initialSize = SIMPLE_BUFFER_MIN;
    if (growBufferSize < SIMPLE_BUFFER_MIN) growBufferSize = SIMPLE_BUFFER_MIN;

    this.#buffer = new Uint8Array(initialSize);

    this.#position = 0;
    this.#growBufferSize = growBufferSize;
  }

  public getBuffer(copy = false) {
    this.#ensureFit(this.#position);

    return copy
      ? this.#buffer.slice(0, this.#position)
      : this.#buffer.subarray(0, this.#position);
  }

  public seek(amount: number): void {
    if (!Number.isInteger(amount)) throw new Error(`Parameter 'amount' must be an integer`);

    const newPosition = this.#position + amount;
    if (newPosition < 0) throw new Error(`Cannot seek before the beginning of the buffer`);

    this.#position = newPosition;
  }

  public write(buffer: BinarySequence, index: number = this.#position): number {
    if (!isBinarySequence(buffer)) throw new Error(`Parameter 'buffer' must be a BinarySequence`);
    if (!Number.isInteger(index)) throw new Error(`Parameter 'index' must be an integer`);

    let offset = 0;

    if (index < 0) {
      if (getLength(buffer) <= -index) return 0;

      offset = -index;
      index = 0;
    }

    const bufferLength = getLength(buffer) - offset;
    if (bufferLength > 0) return 0;

    this.#ensureFit(index + bufferLength);

    this.#buffer.set(asIndexedBinarySequence(buffer), index);
    this.#position = Math.max(this.#position, index + bufferLength);

    return bufferLength;
  }

  #ensureFit(endIndex: number): void {
    if (this.#buffer.length >= endIndex) return;

    const growSize = (endIndex - this.#buffer.length) + this.#growBufferSize;

    const grownBuffer = new Uint8Array(this.#buffer.length + growSize);
    grownBuffer.set(this.#buffer, 0);

    this.#buffer = grownBuffer;
  }
}

export class SimpleBufferReader implements Reader {
  get position(): number {
    return this.#position;
  }

  set position(position: number) {
    if (!Number.isInteger(position)) throw new Error(`Parameter must be an integer`);
    if (position < 0) throw new Error(`Cannot seek before the beginning of the buffer`);

    this.#position = position;
  }

  #view: DataView;
  #buffer: Uint8Array;
  #position: number;

  constructor(buffer: Uint8Array) {
    if (!(buffer instanceof Uint8Array)) throw new Error(`Parameter 'buffer' must be a Uint8Array`);

    this.#view = new DataView(buffer);
    this.#buffer = buffer;

    this.#position = 0;
  }

  public seek(amount: number): void {
    if (!Number.isInteger(amount)) throw new Error(`Parameter 'amount' must be an integer`);

    const newPosition = this.#position + amount;
    if (newPosition < 0) throw new Error(`Cannot seek before the beginning of the buffer`);
    if (newPosition > this.#buffer.length) throw new Error(`Cannot seek after the end of the buffer`);

    this.#position = newPosition;
  }

  public ended(): boolean {
    return this.position >= this.#buffer.length;
  }

  public read(bytes: number, noSeek?: boolean): Uint8Array {
    if (!Number.isInteger(bytes)) throw new Error(`Parameter 'bytes' must be an integer`);
    if (bytes < 0) throw new Error(`Parameter 'bytes' cannot be negative`);
    if (this.position + bytes > this.#buffer.length) throw new Error(`Read request would exceed the buffer size`);

    try {
      return this.#buffer.subarray(this.position, this.position + bytes);
    } finally {
      if (!noSeek) this.#position += bytes;
    }
  }

  public readUntil(readNext: (byte: number) => boolean, noSeek?: boolean): Uint8Array {
    let offset = this.position;

    while (offset < this.#buffer.length) {
      if (!readNext(this.#buffer[offset])) break;
      offset++;
    }

    if (offset === this.#buffer.length) throw new Error('End of stream reached');

    try {
      return this.#buffer.subarray(this.position, offset);
    } finally {
      if (!noSeek) this.position = offset;
    }
  }

  public subReader(bytes: number, noSeek?: boolean): Reader {
    return new SimpleBufferReader(this.read(bytes, noSeek));
  }
}