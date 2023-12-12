import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { container } from "@providers/inversify/container";
import { MapTransitionTeleport } from "@providers/map/MapTransition/MapTransitionTeleport";
import { IEquippableItemBlueprint, ItemSlotType, ItemSubType, ItemType, UserAccountTypes } from "@rpg-engine/shared";
import { MagicsBlueprint } from "../../types/itemsBlueprintTypes";

export const itemFrozenIslandTeleport: IEquippableItemBlueprint = {
  key: MagicsBlueprint.FrozenIslandTeleport,
  type: ItemType.Consumable,
  subType: ItemSubType.Magic,
  textureAtlas: "items",
  texturePath: "magics/ancient-scroll.png",
  name: "Frozen Island Teleport",
  description: "This will teleport you to frozen island",
  allowedEquipSlotType: [ItemSlotType.Accessory],
  weight: 1,
  canSell: false,
  basePrice: 2000,
  canBePurchasedOnlyByPremiumPlans: [UserAccountTypes.PremiumGold, UserAccountTypes.PremiumUltimate],
  usableEffect: async (character: ICharacter) => {
    const mapTransition = container.get(MapTransitionTeleport);
    await mapTransition.changeCharacterScene(character, {
      map: "frozen-island",
      gridX: 116,
      gridY: 64,
    });
  },
};
