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

export const itemTrollsCavesTeleport: IEquippableItemBlueprint = {
  key: MagicsBlueprint.TrollsCavesTeleport,
  type: ItemType.Consumable,
  subType: ItemSubType.Magic,
  textureAtlas: "items",
  texturePath: "magics/trolls-caves-teleport.png",
  name: "trolls-caves teleport",
  description: "This will teleport you to trolls-caves",
  allowedEquipSlotType: [ItemSlotType.Accessory],
  weight: 1,
  canSell: false,
  basePrice: 50,
  canBePurchasedOnlyByPremiumPlans: [UserAccountTypes.PremiumGold, UserAccountTypes.PremiumUltimate],
  usableEffect: async (character: ICharacter) => {
    const mapTransition = container.get(MapTransitionTeleport);
    await mapTransition.changeCharacterScene(character, {
      map: "trolls-caves",
      gridX: ToGridX(5024),
      gridY: ToGridY(1568),
    });
  },
};
