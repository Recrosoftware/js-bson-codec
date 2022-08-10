import {BINARY_SUBTYPE_UUID, BsonSerializableBinary, TO_BSON_SERIALIZABLE_VALUE} from '../constants.ts';
import {BSONTypeError} from '../error.ts';
import {bufferToAscii} from '../utils/ascii.ts';
import {bufferToBase64} from '../utils/base64.ts';
import {BinarySequence, sameContent} from '../utils/binary-sequence.ts';
import {
  bufferToUuidHex,
  isValidUuid,
  isValidUuidBuffer,
  isValidUuidString,
  UUID_BYTE_LENGTH,
  uuidHexToBuffer
} from '../utils/uuid.ts';
import {Binary} from './binary.ts';


/**
 * A class representation of the BSON UUID type.
 * @public
 */
export class UUID {
  static cacheHexString = true;

  #uuid: Uint8Array;
  #uuid_hex?: string;

  /**
   * Create an UUID type
   *
   * @param input - Can be a 32 or 36 character hex string (dashes excluded/included) or a 16 byte binary Buffer.
   */
  constructor(input?: string | UUID | BinarySequence) {
    if (input instanceof UUID) {
      this.#uuid = input.#uuid.slice();
    } else if (isValidUuidBuffer(input)) {
      this.#uuid = new Uint8Array(input);
    } else if (isValidUuidString(input)) {
      this.#uuid = uuidHexToBuffer(input);
    } else {
      throw new BSONTypeError('Argument passed in UUID constructor must be a UUID, a 16 bytes BinarySequence or a 32/36 character hex string (dashes excluded/included, format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx).');
    }

    if (UUID.cacheHexString) this.#uuid_hex = bufferToUuidHex(this.#uuid);
  }

  get id(): Uint8Array {
    return this.#uuid;
  }

  set id(value: string | UUID | BinarySequence) {
    if (value instanceof UUID) this.#uuid = value.#uuid;
    else if (isValidUuidString(value)) this.#uuid = uuidHexToBuffer(value);
    else if (isValidUuidBuffer(value)) this.#uuid = new Uint8Array(value);
    else throw new BSONTypeError('Argument passed in UUID constructor must be a UUID, a 16 bytes BinarySequence or a 32/36 character hex string (dashes excluded/included, format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx).');

    if (UUID.cacheHexString) this.#uuid_hex = bufferToUuidHex(this.#uuid);
  }

  /**
   * Generate a 16 byte uuid v4 buffer used in UUIDs
   */

  /**
   * Returns the UUID id as a 32 or 36 character hex string representation, excluding/including dashes (defaults to 36 character dash separated)
   * */
  toHexString(): string {
    if (UUID.cacheHexString && this.#uuid_hex) return this.#uuid_hex;

    const hex = bufferToUuidHex(this.#uuid);

    if (UUID.cacheHexString) this.#uuid_hex = hex;

    return hex;
  }

  /**
   * Converts the id into a 36 character (dashes included) hex string, unless a encoding is specified.
   */
  toString(encoding: 'base64' | 'ascii' | 'hex' = 'hex'): string {
    if (encoding === 'base64') return bufferToBase64(this.#uuid);
    if (encoding === 'ascii') return bufferToAscii(this.#uuid);
    return this.toHexString();
  }

  /**
   * Compares the equality of this UUID with `otherID`.
   *
   * @param otherId - UUID instance to compare against.
   */
  equals(otherId: string | UUID | BinarySequence): boolean {
    if (!otherId) return false;
    if (otherId instanceof UUID) return sameContent(otherId.#uuid, this.#uuid);

    try {
      return this.equals(new UUID(otherId));
    } catch {
      return false;
    }
  }

  /**
   * Creates a Binary instance from the current UUID.
   */
  toBinary(): Binary {
    return new Binary(this.#uuid, BINARY_SUBTYPE_UUID);
  }

  [TO_BSON_SERIALIZABLE_VALUE](): BsonSerializableBinary {
    return ['binary', BINARY_SUBTYPE_UUID, this.#uuid];
  }

  /**
   * Generates a populated buffer containing a v4 uuid
   */
  static generate(): Uint8Array {
    const bytes = crypto.getRandomValues(new Uint8Array(UUID_BYTE_LENGTH));

    // Per 4.4, set bits for version and `clock_seq_hi_and_reserved`
    // Kindly borrowed from https://github.com/uuidjs/uuid/blob/master/src/v4.js
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x0f) | 0x80;

    return bytes;
  }

  /**
   * Checks if a value is a valid bson UUID
   * @param input - UUID, string or Buffer to validate.
   */
  static isValid(input: string | BinarySequence | UUID): boolean {
    if (!input) return false;
    if (input instanceof UUID) return true;
    return isValidUuid(input);
  }

  /**
   * Creates an UUID from a hex string representation of an UUID.
   * @param hexString - 32 or 36 character hex string (dashes excluded/included).
   */
  static createFromHexString(hexString: string): UUID {
    return new UUID(hexString);
  }
}
