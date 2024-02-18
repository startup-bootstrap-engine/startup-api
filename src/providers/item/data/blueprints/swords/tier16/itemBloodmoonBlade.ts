import { IEquippableMeleeTier16WeaponBlueprint } from "@providers/item/data/types/TierBlueprintTypes";
import { EntityAttackType, ItemSlotType, ItemSubType, ItemType } from "@rpg-engine/shared";
import { SwordsBlueprint } from "../../../types/itemsBlueprintTypes";

export const itemBloodmoonBlade: IEquippableMeleeTier16WeaponBlueprint = {
  key: SwordsBlueprint.BloodmoonBlade,
  type: ItemType.Weapon,
  subType: ItemSubType.Sword,
  textureAtlas: "items",
  texturePath: "swords/bloodmoon-blade.png",
  name: "Bloodmoon Blade",
  description:
    "Forged under the crimson moon's gaze, this blade thirsts for blood, empowering its wielder with each strike under the night sky.",
  attack: 114,
  defense: 90,
  tier: 16,
  weight: 1.5,
  allowedEquipSlotType: [ItemSlotType.LeftHand, ItemSlotType.RightHand],
  rangeType: EntityAttackType.Melee,
  basePrice: 240,
};
