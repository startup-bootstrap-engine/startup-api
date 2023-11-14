import { UserAccountTypes } from "@providers/user/userTypes";
import { MovementSpeed } from "./MovementConstants";

export interface IPremiumAccountData {
  SPXPLostOnDeathReduction: number;
  InventoryLossOnDeathReduction: number;
  maxSpeed: MovementSpeed;
  XPBuff: number;
  lootDropBuff: number;
  teleportCooldownMin: number;
}

export interface IPremiumAccountPlansData {
  [UserAccountTypes.PremiumBronze]: IPremiumAccountData;
  [UserAccountTypes.PremiumSilver]: IPremiumAccountData;
  [UserAccountTypes.PremiumGold]: IPremiumAccountData;
}

export const PREMIUM_ACCOUNT_METADATA = {
  [UserAccountTypes.PremiumBronze]: {
    SPXPLostOnDeathReduction: 20, // only loses 80% of the regular skill loss
    InventoryLossOnDeathReduction: 25, // 25% less chance to drop an item
    maxSpeed: MovementSpeed.Fast,
    XPBuff: 20,
    lootDropBuff: 20,
    teleportCooldownMin: 40,
  },
  [UserAccountTypes.PremiumSilver]: {
    SPXPLostOnDeathReduction: 35, // only loses 60% of the regular skill loss
    InventoryLossOnDeathReduction: 50, // 50% less chance to drop an item
    maxSpeed: MovementSpeed.ExtraFast,
    XPBuff: 30,
    lootDropBuff: 30,
    teleportCooldownMin: 30,
  },
  [UserAccountTypes.PremiumGold]: {
    SPXPLostOnDeathReduction: 50, // only loses 50% of the regular skill loss
    InventoryLossOnDeathReduction: 0, // 75% less chance to drop an item
    maxSpeed: MovementSpeed.ExtraFast,
    XPBuff: 50,
    lootDropBuff: 50,
    teleportCooldownMin: 20,
  },
};
