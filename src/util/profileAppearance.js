export const PROFILE_COLOR_PRESETS = Object.freeze([
  '#2563EB',
  '#7C3AED',
  '#DB2777',
  '#DC2626',
  '#EA580C',
  '#16A34A',
  '#0891B2',
  '#475569',
]);

const PROFILE_COLOR_PATTERN = /^#[0-9A-F]{6}$/;

const hashText = (value) =>
  Array.from(value ?? '').reduce(
    (hash, character) => ((hash * 31) + character.codePointAt(0)) >>> 0,
    0
  );

export const normalizeProfileInitials = (value) =>
  Array.from(value?.trim?.() ?? '').slice(0, 2).join('');

export const getDefaultProfileColor = (seed) =>
  PROFILE_COLOR_PRESETS[hashText(seed) % PROFILE_COLOR_PRESETS.length];

export const getDefaultProfileInitials = (username, userId) =>
  Array.from(normalizeProfileInitials(username || userId || '?')).slice(0, 1).join('') || '?';

export const getProfileAppearance = (user = {}) => {
  const requestedColor = user.profileColor?.trim?.().toUpperCase();
  return {
    profileColor: PROFILE_COLOR_PATTERN.test(requestedColor ?? '')
      ? requestedColor
      : getDefaultProfileColor(user.userId || user.username),
    profileInitials:
      normalizeProfileInitials(user.profileInitials) ||
      getDefaultProfileInitials(user.username, user.userId),
  };
};
