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
import { IEquippableMeleeTier17WeaponBlueprint } from "../../../types/TierBlueprintTypes";
import { DaggersBlueprint } from "../../../types/itemsBlueprintTypes";

export const itemTwilightThornDagger: IEquippableMeleeTier17WeaponBlueprint = {
  key: DaggersBlueprint.TwilightThornDagger,
  type: ItemType.Weapon,
  subType: ItemSubType.Dagger,
  textureAtlas: "items",
  texturePath: "daggers/twilight-thorn-dagger.png",
  name: "Twilight Thorn Dagger",
  description: "Forged from the thorns of the darkened twilight, this dagger is as deadly as it is beautiful.",
  weight: 1.4,
  allowedEquipSlotType: [ItemSlotType.LeftHand, ItemSlotType.RightHand],
  attack: 124,
  defense: 98,
  tier: 17,
  rangeType: EntityAttackType.Melee,
  basePrice: 245,
  entityEffects: [EntityEffectBlueprint.Bleeding],
  entityEffectChance: 85,
  equippedBuff: [
    {
      type: CharacterBuffType.Skill,
      trait: BasicAttribute.Strength,
      buffPercentage: 8,
      durationType: CharacterBuffDurationType.Permanent,
      options: {
        messages: {
          activation: "You feel strength flowing through your body. (+8% strength)",
          deactivation: "You feel strength leaving your body. (-8% strength)",
        },
      },
    },
    {
      type: CharacterBuffType.Skill,
      trait: CombatSkill.Dagger,
      buffPercentage: 7,
      durationType: CharacterBuffDurationType.Permanent,
      options: {
        messages: {
          activation: "You feel the power of dagger flowing through your body. (+7% dagger)",
          deactivation: "You feel the power of dagger leaving your body. (-7% dagger)",
        },
      },
    },
    {
      type: CharacterBuffType.Skill,
      trait: BasicAttribute.MagicResistance,
      buffPercentage: 7,
      durationType: CharacterBuffDurationType.Permanent,
      options: {
        messages: {
          activation: "You feel the power of magicResistance flowing through your body. (+7% magicResistance)",
          deactivation: "You feel the power of magicResistance leaving your body. (-7% magicResistance)",
        },
      },
    },
  ],
  equippedBuffDescription: "Increases strength by 8%, dagger by 7% and magicResistance by 7% respectively",
};
