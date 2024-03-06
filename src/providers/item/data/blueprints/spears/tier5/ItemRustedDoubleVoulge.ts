import {
  BasicAttribute,
  CharacterBuffDurationType,
  CharacterBuffType,
  EntityAttackType,
  ItemSlotType,
  ItemSubType,
  ItemType,
} from "@rpg-engine/shared";
import { IEquippableTwoHandedTier5WeaponBlueprint } from "../../../types/TierBlueprintTypes";
import { SpearsBlueprint } from "../../../types/itemsBlueprintTypes";
import { EntityEffectBlueprint } from "@providers/entityEffects/data/types/entityEffectBlueprintTypes";

export const itemRustedDoubleVoulge: IEquippableTwoHandedTier5WeaponBlueprint = {
  key: SpearsBlueprint.RustedDoubleVoulge,
  type: ItemType.Weapon,
  subType: ItemSubType.Spear,
  textureAtlas: "items",
  texturePath: "spears/rusted-double-voulge.png",
  name: "Rusted Double Voulge",
  description:
    "The Rusted Double Voulge is a two-handed polearm with a long handle and two long blades that have been heavily corroded and rusted over time. Despite its weathered appearance, the weapon is still surprisingly sharp, able to tear through flesh and bone with jagged serrations along the blades.",
  weight: 3,
  allowedEquipSlotType: [ItemSlotType.LeftHand, ItemSlotType.RightHand],
  attack: 88,
  defense: 40,
  tier: 5,
  rangeType: EntityAttackType.Melee,
  basePrice: 44,
  isTwoHanded: true,
  entityEffects: [EntityEffectBlueprint.Bleeding, EntityEffectBlueprint.Burning],
  entityEffectChance: 95,
  equippedBuff: [
    {
      type: CharacterBuffType.Skill,
      trait: BasicAttribute.Strength,
      buffPercentage: 7,
      durationType: CharacterBuffDurationType.Permanent,
      options: {
        messages: {
          activation: "You feel the power of strength flowing through your body. (+7% strength)",
          deactivation: "You feel the power of strength leaving your body. (-7% strength)",
        },
      },
    },
    {
      type: CharacterBuffType.Skill,
      trait: BasicAttribute.Resistance,
      buffPercentage: 7,
      durationType: CharacterBuffDurationType.Permanent,
      options: {
        messages: {
          activation: "You feel the power of resistance flowing through your body. (+7% resistance)",
          deactivation: "You feel the power of resistance leaving your body. (-7% resistance)",
        },
      },
    },
  ],
  equippedBuffDescription: "Increases strength by 7%, and resistance by 7%.",
};
