import { precisionRound } from '@/utils/math';

export default (value, precision = 2) => {
  const number = Number(value);
  if (Number.isNaN(number)) {
    return '';
  }

  return precisionRound(number, precision);
};
