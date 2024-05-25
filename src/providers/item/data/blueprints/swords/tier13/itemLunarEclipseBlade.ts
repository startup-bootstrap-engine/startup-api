import { IEquippableMeleeTier13WeaponBlueprint } from "@providers/item/data/types/TierBlueprintTypes";
import { EntityAttackType, ItemSlotType, ItemSubType, ItemType } from "@rpg-engine/shared";
import { SwordsBlueprint } from "../../../types/itemsBlueprintTypes";

export const itemLunarEclipseBlade: IEquippableMeleeTier13WeaponBlueprint = {
  key: SwordsBlueprint.LunarEclipseBlade,
  type: ItemType.Weapon,
  subType: ItemSubType.Sword,
  textureAtlas: "items",
  texturePath: "swords/lunar-eclipse-blade.png",
  name: "Lunar Eclipse Blade",
  description:
    "Forged under the light of a blood moon, this blade harnesses the mystical energy of the lunar eclipse, striking with otherworldly power.",
  attack: 96,
  defense: 87,
  tier: 13,
  weight: 1.5,
  allowedEquipSlotType: [ItemSlotType.LeftHand, ItemSlotType.RightHand],
  rangeType: EntityAttackType.Melee,
  basePrice: 260,
};
