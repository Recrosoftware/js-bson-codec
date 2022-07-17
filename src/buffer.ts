export interface Writer {
  position: number;

  seek(amount: number): void;

  write(buffer: Uint8Array, index?: number): number;
}

export const SIMPLE_BUFFER_MIN = 16;
export const SIMPLE_BUFFER_INITIAL_SIZE = 256;

export class SimpleBuffer implements Writer {
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

  public getBuffer() {
    this.#ensureFit(this.#position);

    return this.#buffer.subarray(0, this.#position);
  }

  public seek(amount: number): void {
    if (!Number.isInteger(amount)) throw new Error(`Parameter 'amount' must be an integer`);

    const newPosition = this.#position + amount;
    if (newPosition < 0) throw new Error(`Cannot seek before the beginning of the buffer`);

    this.#position = newPosition;
  }

  public write(buffer: Uint8Array, index: number = this.#position): number {
    if (!(buffer instanceof Uint8Array)) throw new Error(`Parameter 'buffer' must be of type Uint8Array`);
    if (!Number.isInteger(index)) throw new Error(`Parameter 'index' must be an integer`);

    if (index < 0) {
      if (buffer.length <= -index) return 0;
      buffer = buffer.subarray(-index);
      index = 0;
    }
    if (buffer.length === 0) return 0;

    this.#ensureFit(index + buffer.length);

    this.#buffer.set(buffer, index);
    this.#position = Math.max(this.#position, index + buffer.length);

    return buffer.length;
  }

  #ensureFit(endIndex: number): void {
    if (this.#buffer.length >= endIndex) return;

    const growSize = (endIndex - this.#buffer.length) + this.#growBufferSize;

    const grownBuffer = new Uint8Array(this.#buffer.length + growSize);
    grownBuffer.set(this.#buffer, 0);

    this.#buffer = grownBuffer;
  }
}