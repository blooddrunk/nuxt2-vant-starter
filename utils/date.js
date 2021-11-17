import { format, parse, parseISO, isDate, toDate, intervalToDuration, addSeconds } from 'date-fns';

export const formatDate = (dateStr, formatStr = 'yyyy-MM-dd', parseFormat = 'yyyyMMdd') => {
  let date = dateStr;

  try {
    if (typeof dateStr === 'string') {
      date = parse(dateStr, parseFormat, new Date());
    } else {
      date = toDate(dateStr);
      if (!isDate(date)) {
        throw new Error(`${dateStr}: must be type of String or Date`);
      }
    }

    return format(date, formatStr);
  } catch (error) {
    return '--';
  }
};

const padZeroLeft = (number) => {
  if (Math.abs(number) < 10) {
    return `0${Math.abs(number)}`;
  }
  return number;
};

export const secondsToClock = (inputSeconds) => {
  inputSeconds = inputSeconds || 0;
  const start = new Date(0);
  const {
    hours = 0,
    minutes = 0,
    seconds = 0,
  } = intervalToDuration({
    start,
    end: addSeconds(start, inputSeconds),
  });

  return `${padZeroLeft(hours)}:${padZeroLeft(minutes)}:${padZeroLeft(seconds)}`;
};

export const rangeToQuery = (
  dateRange,
  { startKey = 'start', endKey = 'end', formatter = (dateStr) => formatDate(dateStr) } = {}
) => {
  if (!dateRange) {
    return {};
  }

  const [start, end] = dateRange;
  return {
    [startKey]: start && formatter(start),
    [endKey]: end && formatter(end),
  };
};

export const fillMissingDate = (
  data = [],
  {
    start,
    end,
    dateKey = 'unit',
    unit = 'date',
    dateFormat = 'yyyy-MM-dd',
    displayFormat = 'yyyy-MM-dd',
    callback,
  } = {}
) => {
  if (!start || !end) {
    return [];
  }

  const dataMap = {};
  const now = new Date();

  data.forEach((item) => {
    const rawDataStr = item[dateKey];
    const date = parse(rawDataStr, dateFormat, now);

    const dateStr = format(date, displayFormat);
    dataMap[dateStr] = {
      ...item,
      [dateKey]: dateStr,
    };
  });

  const startDate = isDate(start) ? toDate(start) : parseISO(start);
  const endDate = isDate(end) ? toDate(end) : parseISO(end);

  const currentDate = startDate;
  currentDate.setHours(0, 0, 0, 0);

  const endTime = endDate.getTime();

  const newData = [];
  while (currentDate.getTime() <= endTime) {
    const currentDateStr = format(currentDate, displayFormat);

    if (Object.prototype.hasOwnProperty.call(dataMap, currentDateStr)) {
      newData.push(dataMap[currentDateStr]);
    } else {
      const newItem = {
        [dateKey]: currentDateStr,
      };
      newData.push(typeof callback === 'function' ? callback(newItem) : newItem);
    }

    if (unit === 'month') {
      currentDate.setMonth(currentDate.getMonth() + 1);
    } else if (unit === 'year') {
      currentDate.setFullYear(currentDate.getFullYear() + 1);
    } else {
      currentDate.setDate(currentDate.getDate() + 1);
    }

    currentDate.setHours(0, 0, 0, 0);
  }

  return newData;
};
