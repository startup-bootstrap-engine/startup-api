import { IBaseItemContainerBlueprint, ItemSlotType, ItemSubType, ItemType, UserAccountTypes } from "@rpg-engine/shared";
import { ContainersBlueprint } from "../../types/itemsBlueprintTypes";

export const itemEmeraldBackpack: Partial<IBaseItemContainerBlueprint> = {
  key: ContainersBlueprint.EmeraldBackpack,
  type: ItemType.Container,
  subType: ItemSubType.Other,
  textureAtlas: "items",
  texturePath: "containers/emerald-backpack.png",
  canBePurchasedOnlyByPremiumPlans: [
    UserAccountTypes.PremiumBronze,
    UserAccountTypes.PremiumSilver,
    UserAccountTypes.PremiumGold,
    UserAccountTypes.PremiumUltimate,
  ],
  name: "Emerald Backpack",
  description:
    "You see an emerald backpack. It has been made using enchanted materials and it has a total of 60 slots.",
  weight: 3,
  basePrice: 50000,
  canSell: false,
  isItemContainer: true,
  generateContainerSlots: 60,
  allowedEquipSlotType: [ItemSlotType.Inventory],
};
