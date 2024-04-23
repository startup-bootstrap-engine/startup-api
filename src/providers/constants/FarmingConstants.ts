// Harvesting yields
export const FARMING_BASE_YIELD = 1;
export const FARMING_SKILL_FACTOR = 0.5;
export const FARMING_LOW_YIELD_FACTOR = 1;
export const FARMING_MEDIUM_YIELD_FACTOR = 2;
export const FARMING_HIGH_YIELD_FACTOR = 3;
export const FARMING_SUPER_YIELD_FACTOR = 4;

// Economics
export const FARMING_HARVEST_PRICE_RATIO = 2.5;
export const FARMING_SEED_PRICE_RATIO = 1;

export const FARMING_RANDOM_REWARD_QTY_CAP = 3;

// Cycle timing
export const MAXIMUM_MINUTES_FOR_GROW: number = 40; // Its a growth BETWEEN Cycles. Careful... its not the total time it takes! The total would be the sum of all cycles.
export const MINIMUM_MINUTES_FOR_WATERING: number = 5; // You'll need to water a plant based on this interval

// Cleanup
export const MAX_HOURS_NO_WATER_DEAD = 2;
export const DEAD_PLANT_REMOVE_HOURS = 1;

const GROWTH_FACTOR_BASE_RATIO = 3;

export const ULTRA_LOW_GROWTH_FACTOR = 1 * GROWTH_FACTOR_BASE_RATIO;
export const LOW_GROWTH_FACTOR = 1.5 * GROWTH_FACTOR_BASE_RATIO;
export const MEDIUM_GROWTH_FACTOR = 2 * GROWTH_FACTOR_BASE_RATIO;
export const HIGH_GROWTH_FACTOR = 2.5 * GROWTH_FACTOR_BASE_RATIO;
export const SUPER_GROWTH_FACTOR = 3 * GROWTH_FACTOR_BASE_RATIO;

export const DEFAULT_PLANT_CYCLE = {
  Seed: 5,
  Sprout: 10,
  Young: 15,
  Mature: 20,
};

export const SLOW_PLANT_CYCLE = {
  Seed: 5,
  Sprout: 12,
  Young: 19,
  Mature: 25,
};

export const FAST_PLANT_CYCLE = {
  Seed: 4,
  Sprout: 8,
  Young: 12,
  Mature: 15,
};
