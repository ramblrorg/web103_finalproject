// The packing_list table only has name / is_packed / is_auto_generated --
// there's no category column -- so "categories" here are derived client-side
// rather than invented backend concepts. Auto-generated essentials get their
// own section, everything a user typed in by hand gets the other.
export const splitPackingItems = (items) => {
  const essentials = items.filter((item) => item.is_auto_generated);
  const custom = items.filter((item) => !item.is_auto_generated);
  return { essentials, custom };
};

export const getPackingProgress = (items) => {
  const total = items.length;
  const packed = items.filter((item) => item.is_packed).length;
  const percent = total === 0 ? 0 : Math.round((packed / total) * 100);
  return { packed, total, percent };
};

// Case/whitespace-insensitive match, used to warn the user client-side when
// they type in a name that (nearly) matches something already on the list.
// This is just a UI nicety -- the backend is the source of truth for
// duplicate handling on generate.
export const findMatchingItem = (items, name) => {
  const normalized = name.trim().toLowerCase();
  if (!normalized) return null;
  return items.find((item) => item.name.trim().toLowerCase() === normalized) ?? null;
};
