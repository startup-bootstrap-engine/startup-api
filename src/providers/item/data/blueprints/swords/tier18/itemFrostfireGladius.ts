import { EntityEffectBlueprint } from "@providers/entityEffects/data/types/entityEffectBlueprintTypes";
import { IEquippableMeleeTier18WeaponBlueprint } from "@providers/item/data/types/TierBlueprintTypes";
import {
  BasicAttribute,
  CharacterBuffDurationType,
  CharacterBuffType,
  CombatSkill,
  EntityAttackType,
  ItemSlotType,
  ItemSubType,
  ItemType,
} from "@rpg-engine/shared";
import { SwordsBlueprint } from "../../../types/itemsBlueprintTypes";

export const itemFrostfireGladius: IEquippableMeleeTier18WeaponBlueprint = {
  key: SwordsBlueprint.FrostfireGladius,
  type: ItemType.Weapon,
  subType: ItemSubType.Sword,
  textureAtlas: "items",
  texturePath: "swords/frostfire-gladius.png",
  name: "Frostfire Gladius",
  description:
    "Forged from enchanted ice and flames, this gladius embodies the deadly duality of frost and fire, cutting through foes with chilling flames.",
  attack: 132,
  defense: 100,
  tier: 18,
  weight: 1.5,
  allowedEquipSlotType: [ItemSlotType.LeftHand, ItemSlotType.RightHand],
  rangeType: EntityAttackType.Melee,
  basePrice: 240,
  entityEffects: [EntityEffectBlueprint.Freezing, EntityEffectBlueprint.Burning],
  entityEffectChance: 85,
  equippedBuff: [
    {
      type: CharacterBuffType.Skill,
      trait: CombatSkill.Sword,
      buffPercentage: 30,
      durationType: CharacterBuffDurationType.Permanent,
    },
    {
      type: CharacterBuffType.Skill,
      trait: BasicAttribute.Resistance,
      buffPercentage: 30,
      durationType: CharacterBuffDurationType.Permanent,
    },
  ],
  equippedBuffDescription: "Increases sword skill and resistance by 30%.",
};
