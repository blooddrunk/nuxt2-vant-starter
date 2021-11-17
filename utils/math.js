import { isNil } from 'lodash-es';

const numberFormatter = new Intl.NumberFormat('en-US');

export const precisionRound = (number, precision = 2) => {
  const factor = Math.pow(10, precision);
  return Math.round(Number.parseFloat(String(number)) * factor) / factor;
};

export const precisionFixed = (number, precision) => {
  const result = precisionRound(number, precision);
  return result.toFixed(precision);
};

export const formatLargeNumber = (
  value,
  {
    breakpoints = [
      [10000, '万'],
      [100000000, '亿'],
    ],
    withSuffix = true,
    invalid = 'N/A',
    precision,
  } = {}
) => {
  const num = Number.parseFloat(value);
  if (Number.isNaN(num)) {
    return invalid;
  }

  const hitBreakpoint = breakpoints
    .slice()
    .reverse()
    .find((breakpoint) => {
      breakpoint = Array.isArray(breakpoint) ? breakpoint : [breakpoint];
      const [breakValue] = breakpoint;
      return Math.abs(num) >= breakValue;
    });

  if (hitBreakpoint) {
    const [breakValue, valueSuffix] = hitBreakpoint;

    return `${precisionRound(num / breakValue, precision)}${withSuffix && valueSuffix ? valueSuffix : ''}`;
  }

  return num;
};

export const toDisplayString = (number, precision) => {
  const fixedNumber = precisionRound(number, precision);
  return numberFormatter.format(fixedNumber);
};

export const toPercentage = (value, { nanValue, precision = 2, multiplier = 1, symbol = '%' } = {}) => {
  if (isNil(value)) {
    return 'N/A';
  }

  const number = Number(value);

  if (Number.isNaN(number) || !isFinite(number) || nanValue === number) {
    return 'N/A';
  }

  return `${precisionRound(value * multiplier, precision)}${symbol || ''}`;
};

export const formatWithUnit = (value, unit = '') => {
  if (isNil(value)) {
    return '--';
  }

  return `${value}${unit}`;
};
