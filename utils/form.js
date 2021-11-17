import { mapValues } from 'lodash-es';

export const jsonToFormData = (params) => {
  if (!params) {
    return null;
  }

  const formData = new FormData();

  Object.keys(params).forEach((key) => {
    if (Array.isArray(params[key])) {
      params[key].forEach((_, index) => {
        const value = params[key][index];
        if (typeof value !== 'undefined') {
          formData.append(`${key}[]`, value);
        }
      });
    } else if (typeof params[key] !== 'undefined') {
      formData.append(key, params[key]);
    }
  });

  return formData;
};

export const jsonToUrlParams = (data) =>
  Object.entries(data).reduce((params, [key, value]) => {
    if (typeof value !== 'undefined') {
      params.append(key, value);
    }
    return params;
  }, new URLSearchParams());

export const getDisplayNameByValue = (value, list = [], fallback = '') => {
  const target = list.find((item) => item.value === value);
  return target ? target.label : fallback;
};

export const getDisplayNameByValueList = (valueList, list = [], fallback = '') => {
  const foundList = list
    .filter((item) => valueList.includes(item.value))
    .map((foundItem) => foundItem.label || fallback);
  return foundList;
};

export const getSearchSelectOptions = (items, { allValue = '', allLabel = '全部' } = {}) => {
  return [
    {
      value: allValue,
      label: allLabel,
    },
  ].concat(items);
};

export const normalizeSelectOptions = (items, { prependAll = true, valueKey = 'key', labelKey = 'value' } = {}) => {
  const result = (items || []).map((item) => ({
    label: item[labelKey],
    value: item[valueKey],
  }));

  if (prependAll) {
    return getSearchSelectOptions(result);
  }
  return result;
};

export const getLookupOfOptionList = (list = [], { valueKey = 'value', labelKey = 'label' } = {}) =>
  list.reduce((lookup, item) => {
    lookup[item[valueKey]] = item[labelKey];
    return lookup;
  }, {});

export const getDisplayNameById = (
  value,
  mapper = {
    1: '是',
    0: '否',
  },
  fallback = '--'
) => {
  if (Array.isArray(mapper)) {
    mapper = getLookupOfOptionList(mapper);
  }

  return mapper[`${value}`] || fallback;
};

export const trimValues = (obj) =>
  mapValues(obj, (value) => {
    if (value && typeof value === 'string') {
      return value.trim();
    }

    return value;
  });
