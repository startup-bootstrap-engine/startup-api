import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { container } from "@providers/inversify/container";
import { MapTransitionQueue } from "@providers/map/MapTransition/MapTransitionQueue";
import { IEquippableItemBlueprint, ItemSlotType, ItemSubType, ItemType, UserAccountTypes } from "@rpg-engine/shared";
import { MagicsBlueprint } from "../../types/itemsBlueprintTypes";

export const itemWildwoodDungeonTeleport: IEquippableItemBlueprint = {
  key: MagicsBlueprint.WildwoodDungeonTeleport,
  type: ItemType.Consumable,
  subType: ItemSubType.Magic,
  textureAtlas: "items",
  texturePath: "magics/ancient-scroll.png",
  name: "Wildwood Dungeon Teleport",
  description: "This will teleport you to Wildwood Dungeon",
  allowedEquipSlotType: [ItemSlotType.Accessory],
  weight: 1,
  canSell: false,
  basePrice: 3000,
  canBePurchasedOnlyByPremiumPlans: [
    UserAccountTypes.PremiumBronze,
    UserAccountTypes.PremiumSilver,
    UserAccountTypes.PremiumGold,
    UserAccountTypes.PremiumUltimate,
  ],
  usableEffect: async (character: ICharacter) => {
    const mapTransition = container.get<MapTransitionQueue>(MapTransitionQueue);
    await mapTransition.teleportCharacter(character, {
      map: "wildwood-dungeon",
      gridX: 48,
      gridY: 99,
    });
  },
};
