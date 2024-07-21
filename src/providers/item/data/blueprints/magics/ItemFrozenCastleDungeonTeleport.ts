import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { container } from "@providers/inversify/container";
import { MapTransitionQueue } from "@providers/map/MapTransition/MapTransitionQueue";
import { IEquippableItemBlueprint, ItemSlotType, ItemSubType, ItemType, UserAccountTypes } from "@rpg-engine/shared";
import { MagicsBlueprint } from "../../types/itemsBlueprintTypes";

export const itemFrozenCastleDungeonTeleport: IEquippableItemBlueprint = {
  key: MagicsBlueprint.FrozenCastleDungeonTeleport,
  type: ItemType.Consumable,
  subType: ItemSubType.Magic,
  textureAtlas: "items",
  texturePath: "magics/blue-scroll.png",
  name: "Frozen Castle Dungeon Teleport",
  description: "This will teleport you to frozen castle dungeon",
  allowedEquipSlotType: [ItemSlotType.Accessory],
  weight: 1,
  canSell: false,
  basePrice: 2200,
  canBePurchasedOnlyByPremiumPlans: [
    UserAccountTypes.PremiumBronze,
    UserAccountTypes.PremiumSilver,
    UserAccountTypes.PremiumGold,
    UserAccountTypes.PremiumUltimate,
  ],
  usableEffect: async (character: ICharacter) => {
    const mapTransition = container.get<MapTransitionQueue>(MapTransitionQueue);
    await mapTransition.teleportCharacter(character, {
      map: "frozen-castle-dungeon",
      gridX: 52,
      gridY: 34,
    });
  },
};
