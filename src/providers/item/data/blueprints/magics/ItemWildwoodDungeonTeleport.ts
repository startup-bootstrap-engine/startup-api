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

export const itemWildwoodDungeonTeleport: IEquippableItemBlueprint = {
  key: MagicsBlueprint.WildwoodDungeonTeleport,
  type: ItemType.Consumable,
  subType: ItemSubType.Magic,
  textureAtlas: "items",
  texturePath: "magics/scroll.png",
  name: "wildwood-dungeon teleport",
  description: "This will teleport you to wildwood-dungeon",
  allowedEquipSlotType: [ItemSlotType.Accessory],
  weight: 1,
  canSell: false,
  basePrice: 40,
  canBePurchasedOnlyByPremiumPlans: [
    UserAccountTypes.PremiumSilver,
    UserAccountTypes.PremiumGold,
    UserAccountTypes.PremiumUltimate,
  ],
  usableEffect: async (character: ICharacter) => {
    const mapTransition = container.get(MapTransitionTeleport);
    await mapTransition.changeCharacterScene(character, {
      map: "wildwood-dungeon",
      gridX: ToGridX(784),
      gridY: ToGridY(512),
    });
  },
};
