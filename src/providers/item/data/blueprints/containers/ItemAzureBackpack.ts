import { IBaseItemContainerBlueprint, ItemSlotType, ItemSubType, ItemType, UserAccountTypes } from "@rpg-engine/shared";
import { ContainersBlueprint } from "../../types/itemsBlueprintTypes";

export const itemAzureBackpack: Partial<IBaseItemContainerBlueprint> = {
  key: ContainersBlueprint.AzureBackpack,
  type: ItemType.Container,
  subType: ItemSubType.Other,
  textureAtlas: "items",
  texturePath: "containers/azure-backpack.png",
  canBePurchasedOnlyByPremiumPlans: [
    UserAccountTypes.PremiumBronze,
    UserAccountTypes.PremiumSilver,
    UserAccountTypes.PremiumGold,
    UserAccountTypes.PremiumUltimate,
  ],
  name: "Azure Backpack",
  description: "You see an azure backpack. It has been made using enchanted materials and it has a total of 50 slots.",
  weight: 3,
  basePrice: 20000,
  canSell: false,
  isItemContainer: true,
  generateContainerSlots: 50,
  allowedEquipSlotType: [ItemSlotType.Inventory],
};
