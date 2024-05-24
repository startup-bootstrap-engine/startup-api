import { IEquippableMeleeTier13WeaponBlueprint } from "@providers/item/data/types/TierBlueprintTypes";
import { EntityAttackType, ItemSlotType, ItemSubType, ItemType } from "@rpg-engine/shared";
import { SwordsBlueprint } from "../../../types/itemsBlueprintTypes";

export const itemVoidslayer: IEquippableMeleeTier13WeaponBlueprint = {
  key: SwordsBlueprint.Voidslayer,
  type: ItemType.Weapon,
  subType: ItemSubType.Sword,
  textureAtlas: "items",
  texturePath: "swords/void-slayer.png",
  name: "Voidslayer",
  description:
    "Forged from the shattered remnants of a dying star, this blade devours all light, plunging its victims into eternal darkness.",
  attack: 97,
  defense: 90,
  tier: 13,
  weight: 1.5,
  allowedEquipSlotType: [ItemSlotType.LeftHand, ItemSlotType.RightHand],
  rangeType: EntityAttackType.Melee,
  basePrice: 290,
};
