import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { container } from "@providers/inversify/container";
import { MapTransitionQueue } from "@providers/map/MapTransition/MapTransitionQueue";
import { IEquippableItemBlueprint, ItemSlotType, ItemSubType, ItemType, UserAccountTypes } from "@rpg-engine/shared";
import { MagicsBlueprint } from "../../types/itemsBlueprintTypes";

export const itemFrostIslandCavesTeleport: IEquippableItemBlueprint = {
  key: MagicsBlueprint.FrostIslandCavesTeleport,
  type: ItemType.Consumable,
  subType: ItemSubType.Magic,
  textureAtlas: "items",
  texturePath: "magics/ancient-scroll.png",
  name: "Frost Island Caves Teleport",
  description: "This will teleport you to frost island caves",
  allowedEquipSlotType: [ItemSlotType.Accessory],
  weight: 1,
  canSell: false,
  basePrice: 2000,
  canBePurchasedOnlyByPremiumPlans: [
    UserAccountTypes.PremiumBronze,
    UserAccountTypes.PremiumSilver,
    UserAccountTypes.PremiumGold,
    UserAccountTypes.PremiumUltimate,
  ],
  usableEffect: async (character: ICharacter) => {
    const mapTransition = container.get<MapTransitionQueue>(MapTransitionQueue);
    await mapTransition.teleportCharacter(character, {
      map: "frost-island-caves",
      gridX: 59,
      gridY: 38,
    });
  },
};
