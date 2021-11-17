export const getDefaultFieldConfig = (field) => {
  if (!Array.isArray(field)) {
    field = [field];
  }
  const [key, initialData = []] = field;

  return [
    key,
    {
      data: initialData,
      initialData,
      loading: false,
      error: null,
    },
  ];
};

export const normalizeFields = (fields) =>
  fields.reduce((acc, cur) => {
    const [key, config] = getDefaultFieldConfig(cur);
    acc[key] = config;
    return acc;
  }, {});
