import { EntityEffectBlueprint } from "@providers/entityEffects/data/types/entityEffectBlueprintTypes";
import {
  CharacterBuffDurationType,
  CharacterBuffType,
  CombatSkill,
  ItemSlotType,
  ItemSubType,
  ItemType,
} from "@rpg-engine/shared";
import { EntityAttackType } from "@rpg-engine/shared/dist/types/entity.types";
import { IEquippableMeleeTier5WeaponBlueprint } from "../../../types/TierBlueprintTypes";
import { SwordsBlueprint } from "../../../types/itemsBlueprintTypes";

export const itemDragonsSword: IEquippableMeleeTier5WeaponBlueprint = {
  key: SwordsBlueprint.DragonsSword,
  type: ItemType.Weapon,
  subType: ItemSubType.Sword,
  textureAtlas: "items",
  texturePath: "swords/dragon's-sword.png",
  name: "Dragon's Sword",
  description:
    "A legendary sword crafted from the remains of a mighty dragon, wielded only by the greatest of warriors.",
  attack: 40,
  defense: 37,
  tier: 5,
  weight: 1,
  allowedEquipSlotType: [ItemSlotType.LeftHand, ItemSlotType.RightHand],
  rangeType: EntityAttackType.Melee,
  basePrice: 121,
  entityEffects: [EntityEffectBlueprint.Burning],
  entityEffectChance: 70,
  equippedBuff: {
    type: CharacterBuffType.Skill,
    trait: CombatSkill.Sword,
    buffPercentage: 10,
    durationType: CharacterBuffDurationType.Permanent,
  },
  equippedBuffDescription: "Increases sword skill by 10%",
};
