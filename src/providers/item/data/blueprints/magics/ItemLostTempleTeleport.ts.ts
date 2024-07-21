import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { container } from "@providers/inversify/container";
import { MapTransitionQueue } from "@providers/map/MapTransition/MapTransitionQueue";
import { IEquippableItemBlueprint, ItemSlotType, ItemSubType, ItemType, UserAccountTypes } from "@rpg-engine/shared";
import { MagicsBlueprint } from "../../types/itemsBlueprintTypes";

export const itemLostTempleTeleport: IEquippableItemBlueprint = {
  key: MagicsBlueprint.LostTempleTeleport,
  type: ItemType.Consumable,
  subType: ItemSubType.Magic,
  textureAtlas: "items",
  texturePath: "magics/ancient-scroll.png",
  name: "Lost Temple Teleport",
  description: "This will teleport you to Lost Temple. Good luck!",
  allowedEquipSlotType: [ItemSlotType.Accessory],
  weight: 0.1,
  canSell: false,
  basePrice: 10000,
  canBePurchasedOnlyByPremiumPlans: [UserAccountTypes.PremiumGold, UserAccountTypes.PremiumUltimate],
  usableEffect: async (character: ICharacter) => {
    const mapTransition = container.get<MapTransitionQueue>(MapTransitionQueue);
    await mapTransition.teleportCharacter(character, {
      map: "lost-temple",
      gridX: 71,
      gridY: 99,
    });
  },
};
