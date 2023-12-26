import {
  BasicAttribute,
  CharacterAttributes,
  CharacterBuffDurationType,
  CharacterBuffType,
  ItemSlotType,
  ItemSubType,
  ItemType,
} from "@rpg-engine/shared";
import { IEquippableArmorTier8Blueprint } from "../../../types/TierBlueprintTypes";
import { ArmorsBlueprint } from "../../../types/itemsBlueprintTypes";

export const itemTemplarsPlate: IEquippableArmorTier8Blueprint = {
  key: ArmorsBlueprint.TemplarsPlate,
  type: ItemType.Armor,
  subType: ItemSubType.Armor,
  textureAtlas: "items",
  texturePath: "armors/templars-plate.png",
  name: "Templar's Plate",
  description:
    "A sacred armor worn by the holy templars, providing divine protection and enhancing the wearer's abilities.",
  defense: 62,
  tier: 8,
  weight: 3,
  allowedEquipSlotType: [ItemSlotType.Torso],
  basePrice: 250,
  equippedBuff: [
    {
      type: CharacterBuffType.Skill,
      trait: BasicAttribute.Resistance,
      buffPercentage: 20,
      durationType: CharacterBuffDurationType.Permanent,
      options: {
        messages: {
          activation: "You feel the power of the templars flowing through your body. (+20% resistance)",
          deactivation: "You feel the power of the templars leaving your body. (-20% resistance)",
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
          activation: "You feel the power of the templars flowing through your body. (+20% magic resistance)",
          deactivation: "You feel the power of the templars leaving your body. (-20% magic resistance)",
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
          activation: "You feel the power of the templars enhancing your vitality. (+20% MaxHealth)",
          deactivation: "You feel the power of the templars leaving your body. (-20% MaxHealth)",
        },
      },
    },
    {
      type: CharacterBuffType.CharacterAttribute,
      trait: CharacterAttributes.MaxMana,
      buffPercentage: 10,
      durationType: CharacterBuffDurationType.Permanent,
      options: {
        messages: {
          activation: "You feel the power of the templars enhancing your mana. (+10% MaxMana)",
          deactivation: "You feel the power of the templars leaving your body. (-10% MaxMana)",
        },
      },
    },
  ],
  equippedBuffDescription:
    "Increases resistance, magic resistance, max health and max mana by 20%, 20%, 20% and 10% respectively",
};
