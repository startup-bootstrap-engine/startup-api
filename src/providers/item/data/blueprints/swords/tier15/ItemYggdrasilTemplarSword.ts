import { EntityEffectBlueprint } from "@providers/entityEffects/data/types/entityEffectBlueprintTypes";
import { IEquippableMeleeTier15WeaponBlueprint } from "@providers/item/data/types/TierBlueprintTypes";
import { EntityAttackType, ItemSlotType, ItemSubType, ItemType } from "@rpg-engine/shared";
import { SwordsBlueprint } from "../../../types/itemsBlueprintTypes";

export const itemYggdrasilTemplarSword: IEquippableMeleeTier15WeaponBlueprint = {
  key: SwordsBlueprint.YggdrasilTemplarSword,
  type: ItemType.Weapon,
  subType: ItemSubType.Sword,
  textureAtlas: "items",
  texturePath: "swords/yggdrasil-templar-sword.png",
  name: "¨Yggdrasil Templar Sword",
  description:
    "Crafted from the wood of the mystical Yggdrasil tree, this Templar sword possessed an ethereal quality that set it apart from all other weapons.",
  weight: 6,
  allowedEquipSlotType: [ItemSlotType.LeftHand, ItemSlotType.RightHand],
  attack: 110,
  defense: 80,
  tier: 15,
  rangeType: EntityAttackType.Melee,
  entityEffects: [EntityEffectBlueprint.Bleeding],
};
