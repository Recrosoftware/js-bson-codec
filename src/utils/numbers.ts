const NUMERIC_INTEGER = /^([+-]?)(0|[1-9]\d*)$/;
const NUMERIC_DECIMAL = /^([+-]?)((?:0|[1-9]\d*)(?:\.\d*)?|\.\d+)(?:[eE]([+-]?(?:0|[1-9]\d*)))?$/;

export function isStringDecimal(value: string): boolean {
  return typeof value === 'string' && NUMERIC_DECIMAL.test(value);
}

export function isStringInteger(value: string): boolean {
  return typeof value === 'string' && NUMERIC_INTEGER.test(value);
}

export type DecimalDefinition = DecimalDefinitionNaN | DecimalDefinitionInfinite | DecimalDefinitionFinite;

export type DecimalDefinitionNaN = {
  nan: true;
  signaling: boolean;
}

export type DecimalDefinitionInfinite = {
  nan: false;

  finite: false;
  negative: boolean;
}

export type DecimalDefinitionFinite = {
  nan: false;

  finite: true;
  negative: boolean;

  digits: bigint;
  exponent: bigint;
}

export function definitionToString(definition: DecimalDefinition): string {
  if (definition.nan) return `NaN`;
  if (!definition.finite) return definition.negative ? `-Infinity` : `Infinity`;

  const abs = definition.exponent === 0n
    ? `${definition.digits}`
    : `${definition.digits}e${definition.exponent}`;

  return definition.negative
    ? `-${abs}`
    : abs;
}


export function parseDecimalValue(value: string | number | bigint): DecimalDefinition {
  if (typeof value === 'number') {
    if (Number.isNaN(value)) return {
      nan: true,
      signaling: false
    };

    if (!Number.isFinite(value)) return {
      nan: false,
      finite: false,
      negative: value < 0
    };

    const str = value.toString();

    // Add support for negative 0
    if (str === '0' && Object.is(value / Number.POSITIVE_INFINITY, -0)) {
      value = '-0';
    } else {
      value = str;
    }
  }

  if (typeof value === 'string') {
    if (/[+-]?Infinity/.test(value)) return {
      nan: false,
      finite: false,
      negative: value[0] === '-'
    };

    const result = NUMERIC_DECIMAL.exec(value);
    if (!result) return {
      nan: true,
      signaling: false
    };

    const negative = result[1] === '-';
    const digitsParts = result[2].split('.');

    let digits = digitsParts[0];
    let exponent = BigInt(result[3] || '0') + BigInt(digits.length);

    digits = (digits + (digitsParts[1] || '')).replace(/0*$/, '');

    const rawDigitsLength = digits.length;
    digits = digits.replace(/^0*/, '') || '0';
    const exponentShift = (rawDigitsLength - digits.length);

    if (digits === '0') {
      exponent = 0n;
    } else {
      exponent -= BigInt(digits.length + exponentShift);
    }

    return {
      nan: false,
      finite: true,
      negative,
      digits: BigInt(digits),
      exponent
    };
  }

  if (typeof value === 'bigint') {
    let digits = value as bigint;

    const negative = digits < 0n;
    if (negative) digits = -digits;

    let exponent = 0n;
    while (true) {
      const quotient = digits / 10n;
      const remainder = digits - (quotient * 10n);

      if (remainder !== 0n) break;

      digits = quotient;
      exponent++;
    }

    return {
      nan: false,
      finite: true,
      negative,
      digits,
      exponent
    };
  }

  return {
    nan: true,
    signaling: false
  };
}

export function integerToHex(value: string | number | bigint): string {
  const valid =
    typeof value === 'bigint'
    || (typeof value === 'number' && Number.isInteger(value))
    || (typeof value === 'string' && isStringInteger(value));

  if (!valid) throw new Error(`Can't convert non integer values to hex`);

  return BigInt(value).toString(16).toUpperCase();
}