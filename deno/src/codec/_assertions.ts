import {BSONError} from '../error.ts';

export function assertEntryType(expected: number, found: number) {
  if (expected !== found) throw new BSONError(`Invalid entry type, expected '${expected}', found '${found}'`);
}