import {
  BINARY_SUBTYPE_GENERIC,
  BINARY_SUBTYPE_UUID,
  BsonBinarySubtype,
  BsonSerializableBinary,
  TO_BSON_SERIALIZABLE_VALUE,
} from "../constants.ts";
import { BSONError, BSONTypeError } from "../error.ts";
import { asciiToBuffer, bufferToAscii } from "../utils/ascii.ts";
import { bufferToBase64 } from "../utils/base64.ts";
import {
  asIndexedBinarySequence,
  BinarySequence,
  getLength,
  isBinarySequence,
} from "../utils/binary-sequence.ts";
import { isBsonBinarySubType } from "../utils/validations.ts";
import { UUID } from "./uuid.ts";

const BINARY_BUFFER_SIZE = 256;

export class Binary {
  static get BUFFER_SIZE() {
    return BINARY_BUFFER_SIZE;
  }

  buffer: Uint8Array;
  subType: BsonBinarySubtype;

  position: number;

  /**
   * Create a new Binary instance.
   *
   * This constructor can accept a string as its first argument. In this case,
   * this string will be encoded using ISO-8859-1, **not** using UTF-8.
   * This is almost certainly not what you want. Use `new Binary(Buffer.from(string))`
   * instead to convert the string to a Buffer using UTF-8 first.
   *
   * @param buffer - a buffer object containing the binary data.
   * @param subType - the option binary type.
   */
  constructor(
    buffer?: string | BinarySequence,
    subType: BsonBinarySubtype = BINARY_SUBTYPE_GENERIC,
  ) {
    if (!isBsonBinarySubType(subType)) {
      throw new BSONTypeError(`Invalid BsonBinarySubtype '${subType}'`);
    }
    this.subType = subType;

    if (buffer == null) {
      this.buffer = new Uint8Array(Binary.BUFFER_SIZE);
      this.position = 0;
    } else {
      if (typeof buffer === "string") {
        this.buffer = asciiToBuffer(buffer);
      } else if (isBinarySequence(buffer)) {
        this.buffer = new Uint8Array(buffer);
      } else {
        throw new BSONTypeError(
          "Binary can only be constructed from string, Uint8Array, ArrayBuffer or number[]",
        );
      }

      this.position = this.buffer.length;
    }
  }

  /**
   * Updates this binary with byte_value.
   *
   * @param byteValue - a single byte we wish to write.
   */
  put(byteValue: string | number | BinarySequence): void {
    // If it's a string and a has more than one character throw an error
    if (typeof byteValue === "string" && byteValue.length !== 1) {
      throw new BSONTypeError("only accepts single character String");
    } else if (
      typeof byteValue !== "number" &&
      getLength(byteValue as BinarySequence) !== 1
    ) {
      throw new BSONTypeError("only accepts single elements BinarySequence");
    }

    // Decode the byte value once
    let decodedByte: number;
    if (typeof byteValue === "string") {
      decodedByte = byteValue.charCodeAt(0);
    } else if (typeof byteValue === "number") {
      decodedByte = byteValue;
    } else {
      decodedByte = asIndexedBinarySequence(byteValue)[0];
    }

    if (
      !Number.isInteger(decodedByte) || decodedByte < 0 || decodedByte > 255
    ) {
      throw new BSONTypeError(
        "only accepts integer number in a valid unsigned byte range 0-255",
      );
    }

    if (this.buffer.length > this.position) {
      this.buffer[this.position++] = decodedByte;
    } else {
      const buffer = new Uint8Array(Binary.BUFFER_SIZE + this.buffer.length);
      buffer.set(this.buffer, 0);

      this.buffer = buffer;
      this.buffer[this.position++] = decodedByte;
    }
  }

  /**
   * Writes a buffer or string to the binary.
   *
   * @param sequence - a string or buffer to be written to the Binary BSON object.
   * @param offset - specify the binary of where to write the content.
   */
  write(
    sequence: string | BinarySequence,
    offset: number = this.position,
  ): void {
    if (typeof sequence === "string") sequence = asciiToBuffer(sequence);
    if (sequence instanceof ArrayBuffer) sequence = new Uint8Array(sequence);

    const buf = sequence as Uint8Array | number[];

    // If the buffer is to small let's extend the buffer
    if (this.buffer.length < offset + buf.length) {
      const buffer = new Uint8Array(offset + buf.length + Binary.BUFFER_SIZE);
      buffer.set(this.buffer, 0);

      // Assign the new buffer
      this.buffer = buffer;
    }

    if (isBinarySequence(buf)) {
      this.buffer.set(buf, offset);
      this.position = Math.max(this.position, offset + buf.length);
    }
  }

  /**
   * Reads **length** bytes starting at **position**.
   *
   * @param position - read from the given position in the Binary.
   * @param length - the number of bytes to read.
   */
  read(position: number, length: number = this.position): Uint8Array {
    return this.buffer.subarray(position, position + length);
  }

  /**
   * Returns the value of this binary as a string.
   * @param asRaw - Will skip converting to a string
   * @remarks
   * This is handy when calling this function conditionally for some key value pairs and not others
   */
  value(asRaw: true): Uint8Array;
  value(asRaw?: false): string;
  value(asRaw = false): string | Uint8Array {
    return asRaw
      ? this.buffer.subarray(0, this.position)
      : bufferToAscii(this.buffer.subarray(0, this.position));
  }

  /** the length of the binary sequence */
  length(): number {
    return this.position;
  }

  toString(format: "base64" | "ascii" = "base64"): string {
    return format === "ascii"
      ? bufferToAscii(this.buffer)
      : bufferToBase64(this.buffer);
  }

  toUUID(): UUID {
    if (this.subType !== BINARY_SUBTYPE_UUID) {
      throw new BSONError(
        `Binary sub_type "${this.subType}" is not supported for converting to UUID. Only "${BINARY_SUBTYPE_UUID}" is currently supported.`,
      );
    }

    return new UUID(this.read(0));
  }

  [TO_BSON_SERIALIZABLE_VALUE](): BsonSerializableBinary {
    return ["binary", this.subType, this.buffer];
  }
}
