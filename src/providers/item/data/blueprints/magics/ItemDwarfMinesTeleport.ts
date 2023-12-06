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

export const itemDwarfMinesTeleport: IEquippableItemBlueprint = {
  key: MagicsBlueprint.DwarfMinesTeleport,
  type: ItemType.Consumable,
  subType: ItemSubType.Magic,
  textureAtlas: "items",
  texturePath: "magics/dwarf-mines-teleport.png",
  name: "dwarf mines teleport",
  description: "This will teleport you to dwarf mines",
  allowedEquipSlotType: [ItemSlotType.Accessory],
  canBePurchasedOnlyByPremiumPlans: [
    UserAccountTypes.PremiumSilver,
    UserAccountTypes.PremiumGold,
    UserAccountTypes.PremiumUltimate,
  ],
  weight: 1,
  canSell: false,
  basePrice: 40,
  usableEffect: async (character: ICharacter) => {
    const mapTransition = container.get(MapTransitionTeleport);
    await mapTransition.changeCharacterScene(character, {
      map: "dwarf-mines",
      gridX: ToGridX(176),
      gridY: ToGridY(1460),
    });
  },
};
