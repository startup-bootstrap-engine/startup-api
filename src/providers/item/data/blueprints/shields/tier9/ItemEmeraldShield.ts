import { IEquippableArmorTier9Blueprint } from "@providers/item/data/types/TierBlueprintTypes";
import {
  BasicAttribute,
  CharacterBuffDurationType,
  CharacterBuffType,
  CombatSkill,
  ItemSlotType,
  ItemSubType,
  ItemType,
} from "@rpg-engine/shared";
import { ShieldsBlueprint } from "../../../types/itemsBlueprintTypes";

export const itemEmeraldShield: IEquippableArmorTier9Blueprint = {
  key: ShieldsBlueprint.EmeraldShield,
  type: ItemType.Armor,
  subType: ItemSubType.Shield,
  textureAtlas: "items",
  texturePath: "shields/emerald-shield.png",
  name: "Emerald Shield",
  description: "A shield made from pure emerald, providing excellent defense and a touch of elegance to the bearer.",
  weight: 2,
  defense: 71,
  tier: 9,
  allowedEquipSlotType: [ItemSlotType.LeftHand, ItemSlotType.RightHand],
  equippedBuff: [
    {
      type: CharacterBuffType.Skill,
      trait: CombatSkill.Shielding,
      buffPercentage: 20,
      durationType: CharacterBuffDurationType.Permanent,
      options: {
        messages: {
          activation: "You feel the power of shielding flowing through your body. (+20% shielding)",
          deactivation: "You feel the power of shielding leaving your body. (-20% shielding)",
        },
      },
    },
    {
      type: CharacterBuffType.Skill,
      trait: BasicAttribute.Strength,
      buffPercentage: 15,
      durationType: CharacterBuffDurationType.Permanent,
      options: {
        messages: {
          activation: "You feel the power of strength flowing through your body. (+15% strength)",
          deactivation: "You feel the power of strength leaving your body. (-15% strength)",
        },
      },
    },
    {
      type: CharacterBuffType.Skill,
      trait: BasicAttribute.Resistance,
      buffPercentage: 10,
      durationType: CharacterBuffDurationType.Permanent,
      options: {
        messages: {
          activation: "You feel the power of resistance flowing through your body. (+10% resistance)",
          deactivation: "You feel the power of resistance leaving your body. (-10% resistance)",
        },
      },
    },
    {
      type: CharacterBuffType.Skill,
      trait: BasicAttribute.Magic,
      buffPercentage: 10,
      durationType: CharacterBuffDurationType.Permanent,
      options: {
        messages: {
          activation: "You feel the power of magic flowing through your body. (+10% magic)",
          deactivation: "You feel the power of magic leaving your body. (-10% magic)",
        },
      },
    },
    {
      type: CharacterBuffType.Skill,
      trait: BasicAttribute.MagicResistance,
      buffPercentage: 20,
      durationType: CharacterBuffDurationType.Permanent,
      options: {
        messages: {
          activation: "You feel the power of magic resistance flowing through your body. (+20% magic resistance)",
          deactivation: "You feel the power of magic resistance leaving your body. (-20% magic resistance)",
        },
      },
    },
  ],
  equippedBuffDescription:
    "Increases shielding by 20%, strength by 15%, resistance by 10%, magic by 10% and magic resistance by 20%.",
};
