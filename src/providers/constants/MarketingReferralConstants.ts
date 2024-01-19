// Marketing

export const CRAFTING_SOCIAL_CRYSTAL_REQUIREMENT_RATIO = 1.5; // higher than 1 means more social crystals required to craft items

export const CRAFTING_SOCIAL_CRYSTAL_MIN_TIER_REQUIREMENT = 6; // minimum tier to require social crystals to craft items

export const CRAFTING_SOCIAL_CRYSTAL_MAX_CAP_REQUIREMENT = 8; // max cap of social crystals required to craft items

export const CRAFTING_SOCIAL_CRYSTAL_DAILY_REWARD_CHANCE = 10; // chance to get social crystals as daily reward, in %

// MapTransitions that requires crystals

const MAP_TRANSITION_SOCIAL_CRYSTAL_REQUIREMENT_RATIO = 1;

const multiplyByRatio = (value: number): number =>
  Math.round(value * MAP_TRANSITION_SOCIAL_CRYSTAL_REQUIREMENT_RATIO) || 1;

export const MAP_TRANSITION_SOCIAL_CRYSTAL_REQUIREMENT = {
  "lost-temple": multiplyByRatio(2),
  "dragons-lair": multiplyByRatio(2),
  "ravenfall-sanctuary": multiplyByRatio(2),
  "minotaurs-island": multiplyByRatio(1),
  "troll-caves": multiplyByRatio(1),
};
