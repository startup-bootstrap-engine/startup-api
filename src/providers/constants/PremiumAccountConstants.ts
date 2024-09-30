import { SpellsBlueprint, UserAccountTypes } from "@rpg-engine/shared";

type CustomSpellCooldown = {
  [spell: string]: number;
};

export interface IPremiumAccountData {
  SPXPLostOnDeathReduction: number;
  InventoryLossOnDeathReduction: number;

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
    SPXPLostOnDeathReduction: 35,
    InventoryLossOnDeathReduction: 35,

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
    SPXPLostOnDeathReduction: 60,
    InventoryLossOnDeathReduction: 60,

    XPBuff: 25,
    lootDropBuff: 25,
    spellCooldownReduction: {
      defaultReduction: 0,
      customReduction: {
        ...generateCustomCooldownReduction(CUSTOM_COOLDOWN_REDUCTION_DEFAULT_GOLD),
      },
    },
    craftingQtyBuff: 25,
    manaRegenPercent: 1.2,
  },
  [UserAccountTypes.PremiumUltimate]: {
    SPXPLostOnDeathReduction: 80,
    InventoryLossOnDeathReduction: 80,

    XPBuff: 35,
    lootDropBuff: 35,
    spellCooldownReduction: {
      defaultReduction: 0,
      customReduction: {
        ...generateCustomCooldownReduction(CUSTOM_COOLDOWN_REDUCTION_DEFAULT_ULTIMATE),
      },
    },
    craftingQtyBuff: 30,
    manaRegenPercent: 1.4,
  },
};
