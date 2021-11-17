import { get, set } from 'lodash-es';

export default (
  config = [
    {
      name: 'dateRange',
      injectedAs: {
        start: 'list.filter.start',
        end: 'list.filter.end',
      },
    },
  ]
) => {
  const computed = config.reduce((acc, cur) => {
    acc[cur.name] = {
      get() {
        return [get(this, cur.injectedAs.start), get(this, cur.injectedAs.end)];
      },

      set(val) {
        const [start = '', end = ''] = val;
        set(this, cur.injectedAs.start, start);
        set(this, cur.injectedAs.end, end);
      },
    };
    return acc;
  }, {});

  return {
    computed,
  };
};
