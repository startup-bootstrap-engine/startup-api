// Marketing

export const CRAFTING_SOCIAL_CRYSTAL_REQUIREMENT_RATIO = 3; // higher than 1 means more social crystals required to craft items

export const CRAFTING_SOCIAL_CRYSTAL_MIN_TIER_REQUIREMENT = 3; // minimum tier to require social crystals to craft items

export const CRAFTING_SOCIAL_CRYSTAL_MAX_CAP_REQUIREMENT = 20; // max cap of social crystals required to craft items

// MapTransitions that requires crystals

const MAP_TRANSITION_SOCIAL_CRYSTAL_REQUIREMENT_RATIO = 1;

const multiplyByRatio = (value: number): number =>
  Math.round(value * MAP_TRANSITION_SOCIAL_CRYSTAL_REQUIREMENT_RATIO) || 1;

export const MAP_TRANSITION_SOCIAL_CRYSTAL_REQUIREMENT = {
  "lost-temple": multiplyByRatio(5),
  "dragons-lair": multiplyByRatio(3),
  "ravenfall-sanctuary": multiplyByRatio(4),
  "minotaurs-island": multiplyByRatio(2),
  "troll-caves": multiplyByRatio(2),
};
