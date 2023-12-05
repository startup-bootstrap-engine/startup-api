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

export const itemShadowlandsSewerTeleport: IEquippableItemBlueprint = {
  key: MagicsBlueprint.ShadowlandsSewerTeleport,
  type: ItemType.Consumable,
  subType: ItemSubType.Magic,
  textureAtlas: "items",
  texturePath: "magics/shadowlands-sewer-teleport.png",
  name: "shadowlands sewer teleport",
  description: "This will teleport you to shadowlands sewer",
  allowedEquipSlotType: [ItemSlotType.Accessory],
  weight: 1,
  canSell: false,
  basePrice: 40,
  canBePurchasedOnlyByPremiumPlans: [UserAccountTypes.PremiumUltimate],
  usableEffect: async (character: ICharacter) => {
    const mapTransition = container.get(MapTransitionTeleport);
    await mapTransition.changeCharacterScene(character, {
      map: "shadowlands-sewer",
      gridX: ToGridX(176),
      gridY: ToGridY(752),
    });
  },
};
