import {
  BasicAttribute,
  CharacterAttributes,
  CharacterBuffDurationType,
  CharacterBuffType,
  ItemSlotType,
  ItemSubType,
  ItemType,
} from "@rpg-engine/shared";
import { IEquippableArmorTier9Blueprint } from "../../../types/TierBlueprintTypes";
import { ArmorsBlueprint } from "../../../types/itemsBlueprintTypes";

export const itemEtherealGuardianMail: IEquippableArmorTier9Blueprint = {
  key: ArmorsBlueprint.EtherealGuardianMail,
  type: ItemType.Armor,
  subType: ItemSubType.Armor,
  textureAtlas: "items",
  texturePath: "armors/ethereal-guardian-mail.png",
  name: "Ethereal Guardian Mail",
  description:
    "A celestial armor worn by the ethereal guardians, providing divine protection and enhancing the wearer's abilities.",
  defense: 71,
  tier: 9,
  weight: 2,
  allowedEquipSlotType: [ItemSlotType.Torso],
  basePrice: 400,
  equippedBuff: [
    {
      type: CharacterBuffType.Skill,
      trait: BasicAttribute.Resistance,
      buffPercentage: 20,
      durationType: CharacterBuffDurationType.Permanent,
      options: {
        messages: {
          activation: "You feel the power of the ethereal guardians flowing through your body. (+20% resistance)",
          deactivation: "You feel the power of the ethereal guardians leaving your body. (-20% resistance)",
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
          activation: "You feel the power of the ethereal guardians flowing through your body. (+20% magic resistance)",
          deactivation: "You feel the power of the ethereal guardians leaving your body. (-20% magic resistance)",
        },
      },
    },
    {
      type: CharacterBuffType.CharacterAttribute,
      trait: CharacterAttributes.MaxHealth,
      buffPercentage: 20,
      durationType: CharacterBuffDurationType.Permanent,
      options: {
        messages: {
          activation: "You feel the power of the ethereal guardians enhancing your vitality. (+20% MaxHealth)",
          deactivation: "You feel the power of the ethereal guardians leaving your body. (-20% MaxHealth)",
        },
      },
    },
    {
      type: CharacterBuffType.CharacterAttribute,
      trait: CharacterAttributes.MaxMana,
      buffPercentage: 20,
      durationType: CharacterBuffDurationType.Permanent,
      options: {
        messages: {
          activation: "You feel the power of the ethereal guardians enhancing your mana. (+20% MaxMana)",
          deactivation: "You feel the power of the ethereal guardians leaving your body. (-20% MaxMana)",
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
          activation: "You feel the power of the ethereal guardians flowing through your body. (+15% strength)",
          deactivation: "You feel the power of the ethereal guardians leaving your body. (-15% strength)",
        },
      },
    },
  ],
  equippedBuffDescription:
    "Increases resistance, magic resistance, max health, max mana and strength by 20%, 20%, 20%, 20% and 15% respectively",
};
