export class BSONError extends Error {
  constructor(message?: string) {
    super(message);
  }
}

export class BSONTypeError extends BSONError {
  constructor(message?: string) {
    super(message);
  }
}