// Marketing

export const CRAFTING_SOCIAL_CRYSTAL_REQUIREMENT_RATIO = 2; // higher than 1 means more social crystals required to craft items

export const CRAFTING_SOCIAL_CRYSTAL_MIN_TIER_REQUIREMENT = 7; // minimum tier to require social crystals to craft items

export const CRAFTING_SOCIAL_CRYSTAL_MAX_CAP_REQUIREMENT = 9; // max cap of social crystals required to craft items

export const CRAFTING_SOCIAL_CRYSTAL_DAILY_REWARD_CHANCE = 100; // chance to get social crystals as daily reward, in %

// MapTransitions that requires crystals

//! Removed map transition requirements for now
// const MAP_TRANSITION_SOCIAL_CRYSTAL_REQUIREMENT_RATIO = 1;

// const multiplyByRatio = (value: number): number =>
//   Math.round(value * MAP_TRANSITION_SOCIAL_CRYSTAL_REQUIREMENT_RATIO) || 1;

export const MAP_TRANSITION_SOCIAL_CRYSTAL_REQUIREMENT = {
  // "lost-temple": multiplyByRatio(1),
  // "dragons-lair": multiplyByRatio(1),
  // "ravenfall-sanctuary": multiplyByRatio(1),
};
