import { formatDate } from '@/utils/date';

export default (dateStr, formatStr = 'yyyy-MM-dd', parseFormat = 'yyyy-MM-dd') => {
  if (!dateStr) {
    return '--';
  }

  try {
    return formatDate(dateStr, formatStr, parseFormat);
  } catch (error) {
    return '--';
  }
};
