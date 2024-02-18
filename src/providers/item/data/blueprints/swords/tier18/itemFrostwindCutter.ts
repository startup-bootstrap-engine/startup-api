import { IEquippableMeleeTier18WeaponBlueprint } from "@providers/item/data/types/TierBlueprintTypes";
import { EntityAttackType, ItemSlotType, ItemSubType, ItemType } from "@rpg-engine/shared";
import { SwordsBlueprint } from "../../../types/itemsBlueprintTypes";

export const itemFrostwindCutter: IEquippableMeleeTier18WeaponBlueprint = {
  key: SwordsBlueprint.FrostwindCutter,
  type: ItemType.Weapon,
  subType: ItemSubType.Sword,
  textureAtlas: "items",
  texturePath: "swords/frostwind-cutter.png",
  name: "Frostwind Cutter",
  description:
    "Crafted by the ancient ice mages of the northern glaciers, this blade harnesses the biting chill of winter to freeze foes in their tracks.",
  attack: 130,
  defense: 85,
  tier: 18,
  weight: 1.2,
  allowedEquipSlotType: [ItemSlotType.LeftHand, ItemSlotType.RightHand],
  rangeType: EntityAttackType.Melee,
  basePrice: 270,
};
