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

export const itemFrostIslandCavesTeleport: IEquippableItemBlueprint = {
  key: MagicsBlueprint.FrostIslandCavesTeleport,
  type: ItemType.Consumable,
  subType: ItemSubType.Magic,
  textureAtlas: "items",
  texturePath: "magics/frost-island-caves-teleport.png",
  name: "frost island caves teleport",
  description: "This will teleport you to frost island caves",
  allowedEquipSlotType: [ItemSlotType.Accessory],
  weight: 1,
  canSell: false,
  basePrice: 25,
  canBePurchasedOnlyByPremiumPlans: [
    UserAccountTypes.PremiumBronze,
    UserAccountTypes.PremiumSilver,
    UserAccountTypes.PremiumGold,
    UserAccountTypes.PremiumUltimate,
  ],
  usableEffect: async (character: ICharacter) => {
    const mapTransition = container.get(MapTransitionTeleport);
    await mapTransition.changeCharacterScene(character, {
      map: "frost-island-caves",
      gridX: ToGridX(912),
      gridY: ToGridY(544),
    });
  },
};
