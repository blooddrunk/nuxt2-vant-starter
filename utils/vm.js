export const getDisplayName = (vm) => {
  if (vm.$root === vm) {
    return '<Root>';
  }

  const name = vm._isVue
    ? vm.$options.name || vm.$options._componentTag
    : vm.name;

  return (
    `<${name || 'Anonymous Component'}>` +
    (vm._isVue && vm.$options.__file ? ' at ' + vm.$options.__file : '')
  );
};

export const convertVNodeArray = (h, wrapperTag, nodes) => {
  // for arrays and single text nodes
  if (nodes.length > 1 || !nodes[0].tag) {
    return h(wrapperTag, {}, nodes);
  }
  return nodes[0];
};

export const getSlotVNode = (vm, h, slotName, data) => {
  // use scopedSlots if available
  if (vm.$scopedSlots[slotName]) {
    const node = vm.$scopedSlots[slotName](data);
    if (!node || (Array.isArray(node) && !node.length)) {
      throw new Error(`Provided scoped slot "${slotName}" is empty`);
    }
    return Array.isArray(node) ? convertVNodeArray(h, vm.tag, node) : node;
  }

  const slot = vm.$slots[slotName];

  if (!slot) {
    throw new Error(`No slot "${slotName}" provided`);
  }

  // 2.5.x compatibility
  if (!slot.length) {
    throw new Error(`Provided slot "${slotName}" is empty`);
  }

  return convertVNodeArray(h, vm.tag, slot);
};

// https://vuejs.org/v2/guide/render-function.html#Complete-Example
export const getChildrenTextContent = (children) => {
  return children
    .map(function (node) {
      return node.children ? getChildrenTextContent(node.children) : node.text;
    })
    .join('');
};
