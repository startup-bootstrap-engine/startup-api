import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { container } from "@providers/inversify/container";
import { MapTransition } from "@providers/map/MapTransition/MapTransition";
import { IEquippableItemBlueprint, ItemSlotType, ItemSubType, ItemType, UserAccountTypes } from "@rpg-engine/shared";
import { MagicsBlueprint } from "../../types/itemsBlueprintTypes";

export const itemDwarfMinesTeleport: IEquippableItemBlueprint = {
  key: MagicsBlueprint.DwarfMinesTeleport,
  type: ItemType.Consumable,
  subType: ItemSubType.Magic,
  textureAtlas: "items",
  texturePath: "magics/ancient-scroll.png",
  name: "Dwarf Mines Teleport",
  description: "This will teleport you to dwarf mines",
  allowedEquipSlotType: [ItemSlotType.Accessory],
  canBePurchasedOnlyByPremiumPlans: [
    UserAccountTypes.PremiumBronze,
    UserAccountTypes.PremiumSilver,
    UserAccountTypes.PremiumGold,
    UserAccountTypes.PremiumUltimate,
  ],
  weight: 1,
  canSell: false,
  basePrice: 1200,
  usableEffect: async (character: ICharacter) => {
    const mapTransition = container.get(MapTransition);
    await mapTransition.teleportCharacter(character, {
      map: "dwarf-mines",
      gridX: 53,
      gridY: 41,
    });
  },
};
