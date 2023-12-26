import { EntityEffectBlueprint } from "@providers/entityEffects/data/types/entityEffectBlueprintTypes";
import { IEquippableMeleeTier13WeaponBlueprint } from "@providers/item/data/types/TierBlueprintTypes";
import { EntityAttackType, ItemSlotType, ItemSubType, ItemType } from "@rpg-engine/shared";
import { SwordsBlueprint } from "../../../types/itemsBlueprintTypes";

export const itemYggdrasilJianSword: IEquippableMeleeTier13WeaponBlueprint = {
  key: SwordsBlueprint.YggdrasilJianSword,
  type: ItemType.Weapon,
  subType: ItemSubType.Sword,
  textureAtlas: "items",
  texturePath: "swords/yggdrasil-jian-sword.png",
  name: "Yggdrasil Jian Sword",
  description:
    "Forged from the sturdy and mystical wood of Yggdrasil, this Jian sword boasts of unparalleled durability and sharpness.",
  weight: 1.7,
  tier: 13,
  allowedEquipSlotType: [ItemSlotType.LeftHand, ItemSlotType.RightHand],
  attack: 98,
  defense: 75,
  rangeType: EntityAttackType.Melee,
  entityEffects: [EntityEffectBlueprint.Bleeding],
};
