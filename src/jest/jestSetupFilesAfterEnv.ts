/* eslint-disable @typescript-eslint/explicit-function-return-type */
import {
  CLASS_BONUS_OR_PENALTIES,
  MODE_EXP_MULTIPLIER,
  RACE_BONUS_OR_PENALTIES,
} from "@providers/character/__tests__/mockConstants/SkillConstants.mock";
import { MovementSpeed } from "@providers/constants/MovementConstants";
import { container, inMemoryHashTable, inMemoryRepository, redisManager } from "@providers/inversify/container";
import { MapLoader } from "@providers/map/MapLoader";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";

let mongoServer: MongoMemoryServer;

jest.mock("speedgoose", () => ({
  clearCacheForKey: jest.fn(() => Promise.resolve()),
  applySpeedGooseCacheLayer: jest.fn(),
  SpeedGooseCacheAutoCleaner: jest.fn(),
}));

jest.mock("@rpg-engine/shared", () => ({
  ...jest.requireActual("@rpg-engine/shared"),
  MagicPower: {
    UltraLow: 5,
    Low: 10,
    Medium: 15,
    High: 20,
    UltraHigh: 25,
    Fatal: 30,
  },
}));

// @ts-ignore
mongoose.Query.prototype.cacheQuery = function () {
  // This is a no-op function
  return this;
};

jest.mock("@providers/constants/MapConstants", () => ({
  EXTERIOR_LIGHTENING_MAPS: [
    "frozen-island",
    "ilya",
    "minotaurs island",
    "farm-land",
    "ilya-dwarf-island",
    "lost-temple",
    "ravenfall-sanctuary",
    "wildwood",
  ],
  NO_LIGHTENING_MAPS: ["ilya-village-interiors", "arena-hell"],
  UNIT_TESTING_MAPS: ["unit-test-map.json", "example.json", "unit-test-map-negative-coordinate.json"],
  DYNAMIC_MAP_DARKNESS: 0.8,
  TEMPORARILY_BLOCKED_MAPS: ["elf-continent_2"],
}));

// mock skill constants to always the same, to avoid having to adjust all tests whenever we change them
jest.mock("@providers/constants/SkillConstants", () => ({
  SP_INCREASE_BASE: 0.2,
  LOW_SKILL_LEVEL_SP_INCREASE_BONUS: 0,
  SP_MAGIC_INCREASE_TIMES_MANA: 0.4,
  INCREASE_BONUS_FACTION: 0.1,
  EXP_RATIO: 1,
  CLASS_BONUS_OR_PENALTIES,
  RACE_BONUS_OR_PENALTIES,
  ML_INCREASE_RATIO: 1.5,
  ML_INCREASE_RATIO_MAGE: 1,
  ML_INCREASE_RATIO_OTHERS: 1,
  MODE_EXP_MULTIPLIER,
  HEALTH_MANA_BASE_INCREASE_RATE: 10,
  DAMAGE_ATTRIBUTE_WEIGHT: 1,
  DAMAGE_COMBAT_SKILL_WEIGHT: 1.5,
  SPELL_CALCULATOR_DEFAULT_MIN_SKILL_MULTIPLIER: 0.5,
  SPELL_CALCULATOR_DEFAULT_MAX_SKILL_MULTIPLIER: 1.5,
}));

jest.mock("@providers/constants/GuildConstants", () => ({
  GUILD_CREATE_MIN_GOLD_REQUIRED: 100000,
  GUILD_XP_GAIN_DIFFICULTY: 1,
  GUILD_SKILL_GAIN_DIFFICULTY: 1,
  GUILD_XP_BONUS: 0.2,
  GUILD_BUFFS: ["strength", "magic", "magicResistance", "resistance"],
  GUILD_LEVEL_BONUS: 0.2,
  GUILD_LEVEL_BONUS_MAX: 50,
  GUILD_INACTIVITY_THRESHOLD_DAYS: 15,
}));

jest.mock("@providers/constants/PartyConstants", () => ({
  PARTY_BONUS_RATIO: 1,
}));
jest.mock("@providers/constants/RaidConstants", () => ({
  RAID_TRIGGERING_CHANCE_RATIO: 1,
}));

jest.mock("@providers/constants/EquipmentConstants", () => ({
  IS_GEAR_CLASS_RESTRICTION_ACTIVE: true,
}));

jest.mock("@providers/constants/AntiMacroConstants", () => ({
  ANTI_MACRO_PROBABILITY_TRIGGER: 5,
  ANTI_MACRO_IDLE_THRESHOLD: 1000,
  CHARACTER_MAX_ACTIONS_STORAGE_THRESHOLD: 2,
  ANTI_MACRO_SKIP_EVENTS_FROM_SIMILARITY_CHECK: [],
  ANTI_MACRO_SIMILARITY_THRESHOLD: 0.5,
}));

jest.mock("@providers/constants/CharacterSkullConstants", () => ({
  CHARACTER_SKULL_AMOUNT_KILLS_NEEDED_TO_RED_SKULL: 3,
  CHARACTER_SKULL_AMOUNT_KILLS_NEEDED_TO_YELLOW_SKULL: 1,
  CHARACTER_SKULL_MAX_TIME_UNTIL_UPGRADE_TO_RED_SKULL: 10 * 24 * 60 * 60 * 1000,
  CHARACTER_SKULL_RED_SKULL_DURATION: 14 * 24 * 60 * 60 * 1000,
  CHARACTER_SKULL_WHITE_SKULL_DURATION: 15 * 60 * 1000,
  CHARACTER_SKULL_YELLOW_SKULL_DURATION: 7 * 24 * 60 * 60 * 1000,
}));

jest.mock("@providers/constants/PremiumAccountConstants", () => ({
  PREMIUM_ACCOUNT_METADATA: {
    free: undefined,
    bronze: {
      SPXPLostOnDeathReduction: 20, // only loses 80% of the regular skill loss
      InventoryLossOnDeathReduction: 25, // 25% less chance to drop an item
      maxSpeed: MovementSpeed.Fast,
      XPBuff: 20,
      lootDropBuff: 20,
      spellCooldownReduction: {
        defaultReduction: 10,
        customReduction: {
          "self-healing-spell": 20,
        },
      },
      craftingQtyBuff: 20,
    },
    silver: {
      SPXPLostOnDeathReduction: 35, // only loses 60% of the regular skill loss
      InventoryLossOnDeathReduction: 50, // 50% less chance to drop an item
      maxSpeed: MovementSpeed.ExtraFast,
      XPBuff: 30,
      lootDropBuff: 30,
      spellCooldownReduction: {
        defaultReduction: 20,
        customReduction: {
          "self-healing-spell": 30,
        },
      },
      craftingQtyBuff: 35,
    },
    gold: {
      SPXPLostOnDeathReduction: 50, // only loses 50% of the regular skill loss
      InventoryLossOnDeathReduction: 0,
      maxSpeed: MovementSpeed.ExtraFast,
      XPBuff: 50,
      lootDropBuff: 50,
      spellCooldownReduction: {
        defaultReduction: 50,
        customReduction: {
          "self-healing-spell": 50,
        },
      },
      craftingQtyBuff: 50,
    },
  },
  ultimate: {
    SPXPLostOnDeathReduction: 100, // only loses 50% of the regular skill loss
    InventoryLossOnDeathReduction: 100, // Do not drop anything on death
    maxSpeed: MovementSpeed.ExtraFast,
    XPBuff: 100,
    lootDropBuff: 50,
    spellCooldownReduction: {
      defaultReduction: 60,
      customReduction: {
        "self-healing-spell": 75,
      },
    },
    craftingQtyBuff: 100,
  },
}));

jest.mock("@providers/constants/DeathConstants", () => ({
  DROP_EQUIPMENT_CHANCE: 15,
  SKILL_LOSS_ON_DEATH_MULTIPLIER: 1,
  INVENTORY_DROP_CHANCE_MULTIPLIER: 1,
}));

jest.mock("@providers/constants/BattleConstants", () => ({
  BATTLE_CRITICAL_HIT_CHANCE: 1.5,
  BATTLE_CRITICAL_HIT_DAMAGE_MULTIPLIER: 1.8,
  BATTLE_HIT_CHANCE_MULTIPLIER: 2,
  BATTLE_BLOCK_CHANCE_MULTIPLIER: 0.2,
  BATTLE_MINIMUM_HIT_CHANCE: 50,
  BONUS_DAMAGE_MULTIPLIER: 3,
  DAMAGE_REDUCTION_MIN_DAMAGE: 1,
  DAMAGE_REDUCTION_MAX_REDUCTION_PERCENTAGE: 0.6,
  DAMAGE_REDUCTION_MIN_LEVEL_FOR_NPC: 30,
  BATTLE_TOTAL_POTENTIAL_DAMAGE_MODIFIER: 1,
  BATTLE_PVP_MELEE_DAMAGE_RATIO: 1,
  BERSERKER_BLOODTHIRST_HEALING_FACTOR: 1,
  MAGE_MANA_SHIELD_DAMAGE_REDUCTION: 1,
  GENERATE_BLOOD_GROUND_ON_HIT: 5,
  GENERATE_BLOOD_ON_DEATH: 25,
}));

jest.mock("@providers/constants/LootConstants", () => ({
  LOOT_GOLD_LEVEL_WEIGHT: 1.5,
  LOOT_GOLD_MAX_HEALTH_WEIGHT: 0.25,
  LOOT_GOLD_QTY_RATIO: 1.5,
  LOOT_GOLD_RESISTANCE_WEIGHT: 1.5,
  LOOT_GOLD_STRENGTH_WEIGHT: 1,
  LOOT_CRAFTING_MATERIAL_DROP_CHANCE: 1,
  LOOT_FOOD_DROP_CHANCE: 0.5,
  LOOT_GOLD_DROP_CHANCE: 1,
  NPC_LOOT_CHANCE_MULTIPLIER: 1,
  LOOT_FOOD_DROP_CHANCE_FOR_NOOB: 0.5,
}));

jest.mock("@providers/constants/CraftingConstants", () => ({
  CRAFTING_MIN_LEVEL_RATIO: 1,
  CRAFTING_DIFFICULTY_RATIO: 1.5,
  CRAFTING_BASE_CHANCE_IMPACT: 0.5,
  CRAFTING_ITEMS_CHANCE: 75,
  CRAFTING_FAILED_TRY_SP_INCREASE_RATIO: 0.1,
  CRAFTING_OUTPUT_QTY_RATIO: 1,
  SOCIAL_CRYSTAL_REQUIREMENT_RATIO: 1.5,
  SOCIAL_CRYSTAL_MIN_TIER_REQUIREMENT: 3,
  SOCIAL_CRYSTAL_MAX_CAP_REQUIREMENT: 7,
}));

jest.mock("@providers/constants/RecipeConstants", () => ({
  RECIPE_REQUIREMENTS_RATIO: 1,
}));

jest.mock("@providers/constants/ItemConstants", () => ({
  TRADER_SELL_PRICE_MULTIPLIER: 0.5,
  TRADER_BUY_PRICE_MULTIPLIER: 1.5,
  MARKETPLACE_BUY_PRICE_MULTIPLIER: 1.5,
  MARKETPLACE_SELL_PRICE_MULTIPLIER: 0.5,
  ITEM_USE_WITH_BASE_EFFECT: 1,
  ITEM_USE_WITH_BASE_SCALING_FACTOR: 0.008,
  ITEM_CLEANUP_THRESHOLD: 100,
  ITEM_PICKUP_DISTANCE_THRESHOLD: 2,
}));

jest.mock("@providers/constants/MarketplaceConstants", () => ({
  BLOCKED_ITEMS_KEY_FOR_MARKETPLACE: ["gold-coin"],
  MARKETPLACE_ITEM_MAX_WEEKS_LENGTH: 1,
}));

jest.mock("@providers/constants/FarmingConstants", () => ({
  FARMING_BASE_YIELD: 1,
  FARMING_SKILL_FACTOR: 0.2,
  FARMING_LOW_YIELD_FACTOR: 1,
  FARMING_MEDIUM_YIELD_FACTOR: 2,
  FARMING_HIGH_YIELD_FACTOR: 3,
  FARMING_SUPER_YIELD_FACTOR: 4,
  MAX_HOURS_NO_WATER_DEAD: 72,
  DEAD_PLANT_REMOVE_HOURS: 1,
  MAXIMUM_MINUTES_FOR_GROW: 120,
  MINIMUM_MINUTES_FOR_WATERING: 5,
  ULTRA_LOW_GROWTH_FACTOR: 1,
  LOW_GROWTH_FACTOR: 1.5,
  MEDIUM_GROWTH_FACTOR: 2,
  HIGH_GROWTH_FACTOR: 2.5,
  SUPER_GROWTH_FACTOR: 3,
  FARMING_HARVEST_PRICE_RATIO: 1,
  FARMING_SEED_PRICE_RATIO: 1,
  DEFAULT_PLANT_CYCLE: {
    Seed: 5,
    Sprout: 10,
    Young: 15,
    Mature: 20,
  },
  SLOW_PLANT_CYCLE: {
    Seed: 5,
    Sprout: 12,
    Young: 19,
    Mature: 25,
  },
  FAST_PLANT_CYCLE: {
    Seed: 4,
    Sprout: 8,
    Young: 12,
    Mature: 15,
  },
}));

jest.mock("@providers/constants/NPCConstants", () => ({
  ...jest.requireActual("@providers/constants/NPCConstants"),
  NPC_TRADER_INTERACTION_DISTANCE: 2,
  NPC_CAN_ATTACK_IN_NON_PVP_ZONE: false,
}));

jest.mock("@providers/constants/PVPConstants", () => ({
  PVP_MIN_REQUIRED_LV: 8,
  PVP_ROGUE_ATTACK_DAMAGE_INCREASE_MULTIPLIER: 0.1,
}));

jest.mock("@providers/constants/CharacterConstants", () => ({
  INITIAL_STARTING_POINTS: {
    "Life Bringer": {
      gridX: 26,
      gridY: 17,
      scene: "ilya-village-sewer",
    },
    "Shadow Walker": {
      gridX: 100,
      gridY: 15,
      scene: "shadowlands-sewer",
    },
    "Farming Mode": {
      gridX: 36,
      gridY: 18,
      scene: "farm-land",
    },
  },
  CharacterGameMode: {
    Farming: "Farming Mode",
  },
}));

jest.mock("mongoose-update-if-current", () => ({
  updateIfCurrentPlugin: jest.fn(), // mock the plugin because otherwise it will break many tests
}));

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();

  await mongoose.connect(mongoServer.getUri(), {
    dbName: "test-database",
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  });

  await mongoose.connection.db.dropDatabase();

  await redisManager.connect();

  await inMemoryHashTable.init();
  await inMemoryRepository.init();
});

afterAll(async () => {
  jest.clearAllTimers();

  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();

  await mongoServer.stop({
    doCleanup: true,
    force: true,
  });

  container.unload();

  await mongoose.disconnect();

  MapLoader.maps.clear();

  await redisManager.client?.flushall();
});

beforeEach(async () => {
  await mongoose.connection.dropDatabase();
});
