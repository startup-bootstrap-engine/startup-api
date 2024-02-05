import { SpellsBlueprint, UserAccountTypes } from "@rpg-engine/shared";
import { MovementSpeed } from "./MovementConstants";
type CustomSpellCooldown = {
  [spell: string]: number;
};

export interface IPremiumAccountData {
  SPXPLostOnDeathReduction: number;
  InventoryLossOnDeathReduction: number;
  maxSpeed: MovementSpeed;
  XPBuff: number;
  lootDropBuff: number;
  spellCooldownReduction: {
    // both are percentages
    defaultReduction: number;
    customReduction: CustomSpellCooldown;
  };
  craftingQtyBuff: number;
  manaRegenPercent: number;
}

export interface IPremiumAccountPlansData {
  [UserAccountTypes.PremiumBronze]: IPremiumAccountData;
  [UserAccountTypes.PremiumSilver]: IPremiumAccountData;
  [UserAccountTypes.PremiumGold]: IPremiumAccountData;
  [UserAccountTypes.PremiumUltimate]: IPremiumAccountData;
}

const CUSTOM_COOLDOWN_REDUCTION_DEFAULT_BRONZE = 20;
const CUSTOM_COOLDOWN_REDUCTION_DEFAULT_SILVER = 35;
const CUSTOM_COOLDOWN_REDUCTION_DEFAULT_GOLD = 50;
const CUSTOM_COOLDOWN_REDUCTION_DEFAULT_ULTIMATE = 75;

const generateCustomCooldownReduction = (defaultValues: number): CustomSpellCooldown => {
  return {
    [SpellsBlueprint.Teleport]: defaultValues,
  };
};

export const PREMIUM_ACCOUNT_METADATA: IPremiumAccountPlansData = {
  [UserAccountTypes.PremiumBronze]: {
    SPXPLostOnDeathReduction: 20,
    InventoryLossOnDeathReduction: 20,
    maxSpeed: MovementSpeed.Fast,
    XPBuff: 5,
    lootDropBuff: 5,
    spellCooldownReduction: {
      defaultReduction: 0,
      customReduction: {
        ...generateCustomCooldownReduction(CUSTOM_COOLDOWN_REDUCTION_DEFAULT_BRONZE),
      },
    },
    craftingQtyBuff: 5,
    manaRegenPercent: 1.05,
  },
  [UserAccountTypes.PremiumSilver]: {
    SPXPLostOnDeathReduction: 35, // only loses 60% of the regular skill loss
    InventoryLossOnDeathReduction: 35, // 50% less chance to drop an item
    maxSpeed: MovementSpeed.Fast,
    XPBuff: 15,
    lootDropBuff: 15,
    spellCooldownReduction: {
      defaultReduction: 0,
      customReduction: {
        ...generateCustomCooldownReduction(CUSTOM_COOLDOWN_REDUCTION_DEFAULT_SILVER),
      },
    },
    craftingQtyBuff: 15,
    manaRegenPercent: 1.1,
  },
  [UserAccountTypes.PremiumGold]: {
    SPXPLostOnDeathReduction: 50, // only loses 50% of the regular skill loss
    InventoryLossOnDeathReduction: 50, // Do not drop anything on death
    maxSpeed: MovementSpeed.Fast,
    XPBuff: 20,
    lootDropBuff: 20,
    spellCooldownReduction: {
      defaultReduction: 0,
      customReduction: {
        ...generateCustomCooldownReduction(CUSTOM_COOLDOWN_REDUCTION_DEFAULT_GOLD),
      },
    },
    craftingQtyBuff: 20,
    manaRegenPercent: 1.15,
  },
  [UserAccountTypes.PremiumUltimate]: {
    SPXPLostOnDeathReduction: 50, // only loses 50% of the regular skill loss
    InventoryLossOnDeathReduction: 50, // Do not drop anything on death
    maxSpeed: MovementSpeed.Fast,
    XPBuff: 25,
    lootDropBuff: 25,
    spellCooldownReduction: {
      defaultReduction: 0,
      customReduction: {
        ...generateCustomCooldownReduction(CUSTOM_COOLDOWN_REDUCTION_DEFAULT_ULTIMATE),
      },
    },
    craftingQtyBuff: 25,
    manaRegenPercent: 1.2,
  },
};
