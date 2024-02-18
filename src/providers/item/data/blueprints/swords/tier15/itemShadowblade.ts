import { IEquippableMeleeTier15WeaponBlueprint } from "@providers/item/data/types/TierBlueprintTypes";
import { EntityAttackType, ItemSlotType, ItemSubType, ItemType } from "@rpg-engine/shared";
import { SwordsBlueprint } from "../../../types/itemsBlueprintTypes";

export const itemShadowblade: IEquippableMeleeTier15WeaponBlueprint = {
  key: SwordsBlueprint.Shadowblade,
  type: ItemType.Weapon,
  subType: ItemSubType.Sword,
  textureAtlas: "items",
  texturePath: "swords/shadowblade.png",
  name: "Shadowblade",
  description:
    "Forged from the darkest ores and imbued with the essence of the night, this blade strikes fear into the hearts of those who face its wielder.",
  attack: 112,
  defense: 92,
  tier: 15,
  weight: 1.3,
  allowedEquipSlotType: [ItemSlotType.LeftHand, ItemSlotType.RightHand],
  rangeType: EntityAttackType.Melee,
  basePrice: 210,
};
