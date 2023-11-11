export interface IPremiumAccountRatio {
  SPXPLostOnDeathRatio: number;
  InventoryLossOnDeathRatio: number;
  SpeedBuff: number;
  XPBuff: number;
  lootDropBuff: number;
  teleportCooldownMin: number;
}

export interface IPremiumAccountData {
  [AccountTypes.PremiumBronze]: IPremiumAccountRatio;
  [AccountTypes.PremiumSilver]: IPremiumAccountRatio;
  [AccountTypes.PremiumGold]: IPremiumAccountRatio;
}

export const PREMIUM_ACCOUNT_TYPES_RATIOS = {
  [AccountTypes.PremiumBronze]: {
    SPXPLostOnDeathRatio: 1 - 0.2, // only loses 80% of the regular skill loss
    InventoryLossOnDeathRatio: 1 - 0.25, // 25% less chance to drop an item
    SpeedBuff: 7,
    XPBuff: 20,
    lootDropBuff: 20,
    teleportCooldownMin: 40,
  },
  [AccountTypes.PremiumSilver]: {
    SPXPLostOnDeathRatio: 1 - 0.35, // only loses 60% of the regular skill loss
    InventoryLossOnDeathRatio: 1 - 0.5, // 50% less chance to drop an item
    SpeedBuff: 13,
    XPBuff: 30,
    lootDropBuff: 30,
    teleportCooldownMin: 30,
  },
  [AccountTypes.PremiumGold]: {
    SPXPLostOnDeathRatio: 1 - 0.5, // only loses 50% of the regular skill loss
    InventoryLossOnDeathRatio: 0, // 75% less chance to drop an item
    SpeedBuff: 15,
    XPBuff: 50,
    lootDropBuff: 50,
    teleportCooldownMin: 20,
  },
};
