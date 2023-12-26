import { IBaseItemContainerBlueprint, ItemSlotType, ItemSubType, ItemType, UserAccountTypes } from "@rpg-engine/shared";
import { ContainersBlueprint } from "../../types/itemsBlueprintTypes";

export const itemCrimsonBackpack: Partial<IBaseItemContainerBlueprint> = {
  key: ContainersBlueprint.CrimsonBackpack,
  type: ItemType.Container,
  subType: ItemSubType.Other,
  textureAtlas: "items",
  texturePath: "containers/crimson-backpack.png",
  canBePurchasedOnlyByPremiumPlans: [
    UserAccountTypes.PremiumBronze,
    UserAccountTypes.PremiumSilver,
    UserAccountTypes.PremiumGold,
    UserAccountTypes.PremiumUltimate,
  ],
  name: "Crimson Backpack",
  description: "You see a crimson backpack. It has been made using enchanted materials and it has a total of 80 slots.",
  weight: 3,
  basePrice: 100000,
  canSell: false,
  isItemContainer: true,
  generateContainerSlots: 80,
  allowedEquipSlotType: [ItemSlotType.Inventory],
};
