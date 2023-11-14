/* eslint-disable @typescript-eslint/explicit-function-return-type */
import {
  CLASS_BONUS_OR_PENALTIES,
  MODE_EXP_MULTIPLIER,
  RACE_BONUS_OR_PENALTIES,
} from "@providers/character/__tests__/mockConstants/SkillConstants.mock";
import { MovementSpeed } from "@providers/constants/MovementConstants";
import { container, redisManager } from "@providers/inversify/container";
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
  MODE_EXP_MULTIPLIER,
  HEALTH_MANA_BASE_INCREASE_RATE: 10,
  DAMAGE_ATTRIBUTE_WEIGHT: 1,
  DAMAGE_COMBAT_SKILL_WEIGHT: 1.5,
  SPELL_CALCULATOR_DEFAULT_MIN_SKILL_MULTIPLIER: 0.5,
  SPELL_CALCULATOR_DEFAULT_MAX_SKILL_MULTIPLIER: 1.5,
}));

jest.mock("@providers/constants/PartyConstants", () => ({
  PARTY_BONUS_RATIO: 1,
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
          ["self-healing-spell"]: 50,
        },
      },
    },
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
  BATTLE_TOTAL_POTENTIAL_DAMAGE_MODIFIER: 1,
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
}));

jest.mock("@providers/constants/CraftingConstants", () => ({
  CRAFTING_MIN_LEVEL_RATIO: 1,
  CRAFTING_DIFFICULTY_RATIO: 1.5,
  CRAFTING_BASE_CHANCE_IMPACT: 0.5,
  CRAFTING_ITEMS_CHANCE: 75,
  CRAFTING_FAILED_TRY_SP_INCREASE_RATIO: 0.1,
  CRAFTING_OUTPUT_QTY_RATIO: 1,
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

jest.mock("@providers/constants/NPCConstants", () => ({
  ...jest.requireActual("@providers/constants/NPCConstants"),
  NPC_TRADER_INTERACTION_DISTANCE: 2,
}));

jest.mock("@providers/constants/PVPConstants", () => ({
  PVP_MIN_REQUIRED_LV: 8,
  PVP_ROGUE_ATTACK_DAMAGE_INCREASE_MULTIPLIER: 0.1,
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

  await redisManager.client.flushAll();
});

beforeEach(async () => {
  await mongoose.connection.dropDatabase();
});
