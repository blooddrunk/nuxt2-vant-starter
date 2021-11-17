import { isNil } from 'lodash-es';

import { precisionRound } from '@/utils/math';

export default (value, { precision = 2, nanValue } = {}) => {
  if (isNil(value)) {
    return 'N/A';
  }

  const number = Number(value);
  if (Number.isNaN(number) || nanValue === number) {
    return 'N/A';
  }

  return `${new Intl.NumberFormat('en-US').format(precisionRound(number, precision))}`;
};
