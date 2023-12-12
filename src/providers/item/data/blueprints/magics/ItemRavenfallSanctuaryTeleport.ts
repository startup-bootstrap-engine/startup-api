import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { container } from "@providers/inversify/container";
import { MapTransitionTeleport } from "@providers/map/MapTransition/MapTransitionTeleport";
import { IEquippableItemBlueprint, ItemSlotType, ItemSubType, ItemType, UserAccountTypes } from "@rpg-engine/shared";
import { MagicsBlueprint } from "../../types/itemsBlueprintTypes";

export const itemRavenfallSanctuaryTeleport: IEquippableItemBlueprint = {
  key: MagicsBlueprint.RavenfallSanctuaryTeleport,
  type: ItemType.Consumable,
  subType: ItemSubType.Magic,
  textureAtlas: "items",
  texturePath: "magics/blue-scroll.png",
  name: "Ravenfall Sanctuary Teleport",
  description: "This will teleport you to ravenfall sanctuary. Good luck!",
  allowedEquipSlotType: [ItemSlotType.Accessory],
  weight: 1,
  canSell: false,
  basePrice: 8000,
  canBePurchasedOnlyByPremiumPlans: [UserAccountTypes.PremiumGold, UserAccountTypes.PremiumUltimate],
  usableEffect: async (character: ICharacter) => {
    const mapTransition = container.get(MapTransitionTeleport);
    await mapTransition.changeCharacterScene(character, {
      map: "ravenfall-sanctuary",
      gridX: 158,
      gridY: 19,
    });
  },
};
