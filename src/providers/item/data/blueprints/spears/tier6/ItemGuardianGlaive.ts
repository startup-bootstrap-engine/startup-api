import { EntityEffectBlueprint } from "@providers/entityEffects/data/types/entityEffectBlueprintTypes";
import { IEquippableTwoHandedTier6WeaponBlueprint } from "@providers/item/data/types/TierBlueprintTypes";
import {
  BasicAttribute,
  CharacterBuffDurationType,
  CharacterBuffType,
  EntityAttackType,
  ItemSlotType,
  ItemSubType,
  ItemType,
} from "@rpg-engine/shared";
import { SpearsBlueprint } from "../../../types/itemsBlueprintTypes";

export const itemGuardianGlaive: IEquippableTwoHandedTier6WeaponBlueprint = {
  key: SpearsBlueprint.GuardianGlaive,
  type: ItemType.Weapon,
  subType: ItemSubType.Spear,
  textureAtlas: "items",
  texturePath: "spears/guardian-glaive.png",
  name: "Guardian Glaive",
  description: "With a defensive shorter arm designed to parry blows, this spear ensures both offense and defense.",
  weight: 4,
  allowedEquipSlotType: [ItemSlotType.LeftHand, ItemSlotType.RightHand],
  attack: 102,
  defense: 48,
  tier: 6,
  isTwoHanded: true,
  rangeType: EntityAttackType.Melee,
  basePrice: 65,
  entityEffects: [EntityEffectBlueprint.Poison, EntityEffectBlueprint.Burning],
  entityEffectChance: 100,
  equippedBuff: [
    {
      type: CharacterBuffType.Skill,
      trait: BasicAttribute.Strength,
      buffPercentage: 12,
      durationType: CharacterBuffDurationType.Permanent,
      options: {
        messages: {
          activation: "You feel the power of strength flowing through your body. (+12% strength)",
          deactivation: "You feel the power of strength leaving your body. (-12% strength)",
        },
      },
    },
    {
      type: CharacterBuffType.Skill,
      trait: BasicAttribute.Resistance,
      buffPercentage: 12,
      durationType: CharacterBuffDurationType.Permanent,
      options: {
        messages: {
          activation: "You feel the power of resistance flowing through your body. (+12% resistance)",
          deactivation: "You feel the power of resistance leaving your body. (-12% resistance)",
        },
      },
    },
    {
      type: CharacterBuffType.Skill,
      trait: BasicAttribute.Magic,
      buffPercentage: 7,
      durationType: CharacterBuffDurationType.Permanent,
      options: {
        messages: {
          activation: "You feel the power of magic flowing through your body. (+7% magic)",
          deactivation: "You feel the power of magic leaving your body. (-7% magic)",
        },
      },
    },
  ],
  equippedBuffDescription: "Increases strength by 12%, resistance by 12% and magic by 7%",
};
