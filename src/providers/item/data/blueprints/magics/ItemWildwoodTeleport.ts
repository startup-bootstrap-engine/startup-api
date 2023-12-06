import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { container } from "@providers/inversify/container";
import { MapTransitionTeleport } from "@providers/map/MapTransition/MapTransitionTeleport";
import {
  IEquippableItemBlueprint,
  ItemSlotType,
  ItemSubType,
  ItemType,
  ToGridX,
  ToGridY,
  UserAccountTypes,
} from "@rpg-engine/shared";
import { MagicsBlueprint } from "../../types/itemsBlueprintTypes";

export const itemWildwoodTeleport: IEquippableItemBlueprint = {
  key: MagicsBlueprint.WildwoodTeleport,
  type: ItemType.Consumable,
  subType: ItemSubType.Magic,
  textureAtlas: "items",
  texturePath: "magics/red-scroll.png",
  name: "wildwood teleport",
  description: "This will teleport you to wildwood",
  allowedEquipSlotType: [ItemSlotType.Accessory],
  weight: 1,
  canSell: false,
  basePrice: 60,
  canBePurchasedOnlyByPremiumPlans: [UserAccountTypes.PremiumUltimate],
  usableEffect: async (character: ICharacter) => {
    const mapTransition = container.get(MapTransitionTeleport);
    await mapTransition.changeCharacterScene(character, {
      map: "wildwood",
      gridX: ToGridX(432),
      gridY: ToGridY(1184),
    });
  },
};
