import { UserAccountTypes } from "@providers/user/userTypes";

export interface IPremiumAccountRatio {
  SPXPLostOnDeathReduction: number;
  InventoryLossOnDeathReduction: number;
  SpeedBuff: number;
  XPBuff: number;
  lootDropBuff: number;
  teleportCooldownMin: number;
}

export interface IPremiumAccountData {
  [UserAccountTypes.PremiumBronze]: IPremiumAccountRatio;
  [UserAccountTypes.PremiumSilver]: IPremiumAccountRatio;
  [UserAccountTypes.PremiumGold]: IPremiumAccountRatio;
}

export const PREMIUM_ACCOUNT_TYPES_RATIOS = {
  [UserAccountTypes.PremiumBronze]: {
    SPXPLostOnDeathReduction: 20, // only loses 80% of the regular skill loss
    InventoryLossOnDeathReduction: 25, // 25% less chance to drop an item
    SpeedBuff: 7,
    XPBuff: 20,
    lootDropBuff: 20,
    teleportCooldownMin: 40,
  },
  [UserAccountTypes.PremiumSilver]: {
    SPXPLostOnDeathReduction: 35, // only loses 60% of the regular skill loss
    InventoryLossOnDeathReduction: 50, // 50% less chance to drop an item
    SpeedBuff: 13,
    XPBuff: 30,
    lootDropBuff: 30,
    teleportCooldownMin: 30,
  },
  [UserAccountTypes.PremiumGold]: {
    SPXPLostOnDeathReduction: 50, // only loses 50% of the regular skill loss
    InventoryLossOnDeathReduction: 0, // 75% less chance to drop an item
    SpeedBuff: 15,
    XPBuff: 50,
    lootDropBuff: 50,
    teleportCooldownMin: 20,
  },
};
