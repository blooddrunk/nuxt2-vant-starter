export default (aclConfig = {}) => {
  function evaluate(rule, subject, ...args) {
    if (typeof rule === 'function') {
      const user = { ...this.$store.getters['auth/user'] };
      user.menu = this.$store.getters['auth/permittedMenuMapByRoute'];
      user.role = this.$store.getters['auth/role'];
      user.isAdmin = this.$store.getters['auth/isAdmin'];

      return rule(user, subject, ...args);
    } else if (rule === undefined) {
      throw new Error(`[withAcl]: no rule found for your verb, provided config: ${JSON.stringify(aclConfig)}`);
    } else {
      return !!rule;
    }
  }

  function can(verbs, subjectArgs = '', ...args) {
    if (!Array.isArray(subjectArgs)) {
      subjectArgs = [subjectArgs];
    }
    const [subject, modifier = 'every'] = subjectArgs;

    const predicate = (verb) => evaluate.call(this, aclConfig[verb], subject, args);

    let result;

    if (typeof verbs === 'string') {
      result = predicate(verbs);
    } else if (Array.isArray(verbs)) {
      result = verbs[modifier](predicate);
    } else {
      result = true;
    }

    return result;
  }

  return {
    methods: {
      $can(verb, subject, ...args) {
        return can.call(this, verb, subject, ...args);
      },

      $cannot(verb, subject, ...args) {
        return !can.call(this, verb, subject, ...args);
      },
    },
  };
};
