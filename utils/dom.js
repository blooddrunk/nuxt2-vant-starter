export const normalizeId = (id) => {
  return id && id.replace(/[/\s()]/g, '__');
};
