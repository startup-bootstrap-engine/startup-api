import { EntityEffectBlueprint } from "@providers/entityEffects/data/types/entityEffectBlueprintTypes";
import {
  BasicAttribute,
  CharacterBuffDurationType,
  CharacterBuffType,
  CombatSkill,
  ItemSlotType,
  ItemSubType,
  ItemType,
} from "@rpg-engine/shared";
import { EntityAttackType } from "@rpg-engine/shared/dist/types/entity.types";
import { IEquippableMeleeTier12WeaponBlueprint } from "../../../types/TierBlueprintTypes";
import { DaggersBlueprint } from "../../../types/itemsBlueprintTypes";

export const itemShadowstrikeDagger: IEquippableMeleeTier12WeaponBlueprint = {
  key: DaggersBlueprint.ShadowstrikeDagger,
  type: ItemType.Weapon,
  subType: ItemSubType.Dagger,
  textureAtlas: "items",
  texturePath: "daggers/shadowstrike-dagger.png",
  name: "Shadowstrike Dagger",
  description: "Crafted from the shadows, this dagger excels in stealth and silent eliminations.",
  weight: 1.5,
  allowedEquipSlotType: [ItemSlotType.LeftHand, ItemSlotType.RightHand],
  attack: 90,
  defense: 79,
  tier: 12,
  rangeType: EntityAttackType.Melee,
  basePrice: 160,
  entityEffects: [EntityEffectBlueprint.Bleeding],
  entityEffectChance: 85,
  equippedBuff: [
    {
      type: CharacterBuffType.Skill,
      trait: BasicAttribute.Strength,
      buffPercentage: 7,
      durationType: CharacterBuffDurationType.Permanent,
      options: {
        messages: {
          activation: "You feel strength flowing through your body. (+7% strength)",
          deactivation: "You feel strength leaving your body. (-7% strength)",
        },
      },
    },
    {
      type: CharacterBuffType.Skill,
      trait: CombatSkill.Dagger,
      buffPercentage: 6,
      durationType: CharacterBuffDurationType.Permanent,
      options: {
        messages: {
          activation: "You feel the power of dagger flowing through your body. (+6% dagger)",
          deactivation: "You feel the power of dagger leaving your body. (-6% dagger)",
        },
      },
    },
    {
      type: CharacterBuffType.Skill,
      trait: BasicAttribute.MagicResistance,
      buffPercentage: 6,
      durationType: CharacterBuffDurationType.Permanent,
      options: {
        messages: {
          activation: "You feel the power of magicResistance flowing through your body. (+6% magicResistance)",
          deactivation: "You feel the power of magicResistance leaving your body. (-6% magicResistance)",
        },
      },
    },
  ],
  equippedBuffDescription: "Increases strength by 7%, dagger by 6% and magicResistance by 6% respectively",
};
