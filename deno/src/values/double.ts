import {
  BsonSerializableDouble,
  TO_BSON_SERIALIZABLE_VALUE,
} from "../constants.ts";

export class Double {
  readonly value: number;

  constructor(value: number) {
    this.value = Number(value);
  }

  valueOf(): number {
    return this.value;
  }

  toString(radix?: number): string {
    return this.value.toString(radix);
  }

  [TO_BSON_SERIALIZABLE_VALUE](): BsonSerializableDouble {
    return ["double", this.value];
  }
}
