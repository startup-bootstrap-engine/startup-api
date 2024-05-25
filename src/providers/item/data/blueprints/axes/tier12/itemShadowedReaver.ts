import { EntityEffectBlueprint } from "@providers/entityEffects/data/types/entityEffectBlueprintTypes";
import { IEquippableMeleeTier12WeaponBlueprint } from "@providers/item/data/types/TierBlueprintTypes";
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
import { AxesBlueprint } from "../../../types/itemsBlueprintTypes";

export const itemShadowedReaver: IEquippableMeleeTier12WeaponBlueprint = {
  key: AxesBlueprint.ShadowedReaver,
  type: ItemType.Weapon,
  subType: ItemSubType.Axe,
  textureAtlas: "items",
  texturePath: "axes/shadowed-reaver.png",
  name: "Shadowed Reaver",
  description: "A sinister axe cloaked in darkness, draining the life force of its victims.",
  weight: 5,
  allowedEquipSlotType: [ItemSlotType.LeftHand, ItemSlotType.RightHand],
  attack: 89,
  defense: 90,
  tier: 12,
  rangeType: EntityAttackType.Melee,
  basePrice: 122,
  entityEffects: [EntityEffectBlueprint.Corruption],
  entityEffectChance: 70,
  equippedBuff: [
    {
      type: CharacterBuffType.Skill,
      trait: BasicAttribute.Strength,
      buffPercentage: 5,
      durationType: CharacterBuffDurationType.Permanent,
      options: {
        messages: {
          activation: "You feel the power of strength flowing through your body. (+5% strength)",
          deactivation: "You feel the power of strength leaving your body. (-5% strength)",
        },
      },
    },
    {
      type: CharacterBuffType.Skill,
      trait: CombatSkill.Axe,
      buffPercentage: 5,
      durationType: CharacterBuffDurationType.Permanent,
      options: {
        messages: {
          activation: "You feel the power of axe flowing through your body. (+5% axe)",
          deactivation: "You feel the power of axe leaving your body. (-5% axe)",
        },
      },
    },
  ],
  equippedBuffDescription: "Increases strength by 5% and axe by 5% respectively",
};
