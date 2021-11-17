import { isNil } from 'lodash-es';

export const isNumeric = (num) => !Number.isNaN(Number.parseFloat(String(num)));

export const isNumericStrict = (num) => !isNaN(Number(num)) && isNumeric(num);

export const arrayToTree = (items, { idKey = 'id', parentIdKey = 'parentId', rootValue = null } = {}) => {
  if (!items) {
    return {
      tree: [],
    };
  }

  const rootItems = [];
  const lookup = {};

  items.forEach((item) => {
    const itemId = item[idKey];

    if (itemId === rootValue) {
      return;
    }

    const parentId = item[parentIdKey];

    if (!Object.prototype.hasOwnProperty.call(lookup, itemId)) {
      lookup[itemId] = { ...item };
    } else {
      lookup[itemId] = {
        ...item,
        ...lookup[itemId],
      };
    }

    const treeItem = lookup[itemId];
    if (!parentId || parentId === rootValue) {
      rootItems.push(treeItem);
    } else {
      if (!Object.prototype.hasOwnProperty.call(lookup, parentId)) {
        lookup[parentId] = {};
      }

      if (!Object.prototype.hasOwnProperty.call(lookup[parentId], 'children')) {
        lookup[parentId].children = [];
      }

      lookup[parentId].children.push(treeItem);
    }
  });

  return {
    tree: rootItems,
    lookup,
  };
};

export const breakStringWith = (str, { breakpoint, breakBy = '\n' } = {}) => {
  if (!str || breakpoint <= 0) {
    return str;
  }

  if (typeof breakpoint === 'function') {
    breakpoint = breakpoint(str);
  }

  return str.replace(new RegExp(`(.{${breakpoint}})`, 'g'), `$1${breakBy}`);
};

export const getPlaceholderForNonValue = (value, { placeholder = '--', nonValue } = {}) => {
  if (isNil(value) || nonValue === value || (Array.isArray(value) && value.length === 0)) {
    return placeholder;
  }

  return value;
};

export const maskStringStart = (str, { symbol = '*', count = 4 } = {}) =>
  str.replace(new RegExp(`^(.{1,${count}})`), (match) => symbol.repeat(match.length));

export const maskStringEnd = (str, { symbol = '*', count = 4 } = {}) =>
  str.replace(new RegExp(`(.{1,${count}})$`), (match) => symbol.repeat(match.length));

export const maskString = (str) => {
  if (!str || typeof str !== 'string') {
    return str;
  }

  str = `${str}`;

  let maskStr = '';
  if (str.length > 7) {
    maskStr = `${str.slice(0, 3)}${'*'.repeat(str.slice(3, -4).length)}${str.slice(-5, -1)}`;
  } else if (str.length > 6) {
    maskStr = `${str.slice(0, 2)}${'*'.repeat(str.slice(2, -4).length)}${str.slice(-5, -1)}`;
  } else {
    maskStr = maskStringStart(str, {
      count: str.length - 1,
    });
  }

  return maskStr;
};
