import {
  BasicAttribute,
  CharacterAttributes,
  CharacterBuffDurationType,
  CharacterBuffType,
  ItemSlotType,
  ItemSubType,
  ItemType,
} from "@rpg-engine/shared";
import { IEquippableArmorTier7Blueprint } from "../../../types/TierBlueprintTypes";
import { ArmorsBlueprint } from "../../../types/itemsBlueprintTypes";

export const itemDarkArmor: IEquippableArmorTier7Blueprint = {
  key: ArmorsBlueprint.DarkArmor,
  type: ItemType.Armor,
  subType: ItemSubType.Armor,
  textureAtlas: "items",
  texturePath: "armors/dark-armor.png",
  name: "Dark Armor",
  description:
    "A mysterious armor imbued with dark magic, providing excellent protection and enhancing the wearer's abilities.",
  defense: 52,
  tier: 7,
  weight: 3,
  allowedEquipSlotType: [ItemSlotType.Torso],
  basePrice: 250,
  equippedBuff: [
    {
      type: CharacterBuffType.Skill,
      trait: BasicAttribute.Resistance,
      buffPercentage: 15,
      durationType: CharacterBuffDurationType.Permanent,
      options: {
        messages: {
          activation: "You feel the power of the darkness flowing through your body. (+15% resistance)",
          deactivation: "You feel the power of the darkness leaving your body. (-15% resistance)",
        },
      },
    },
    {
      type: CharacterBuffType.Skill,
      trait: BasicAttribute.MagicResistance,
      buffPercentage: 15,
      durationType: CharacterBuffDurationType.Permanent,
      options: {
        messages: {
          activation: "You feel the power of the darkness flowing through your body. (+15% magic resistance)",
          deactivation: "You feel the power of the darkness leaving your body. (-15% magic resistance)",
        },
      },
    },
    {
      type: CharacterBuffType.CharacterAttribute,
      trait: CharacterAttributes.MaxHealth,
      buffPercentage: 15,
      durationType: CharacterBuffDurationType.Permanent,
      options: {
        messages: {
          activation: "You feel the power of the darkness enhancing your vitality. (+15% MaxHealth)",
          deactivation: "You feel the power of the darkness leaving your body. (-15% MaxHealth)",
        },
      },
    },
  ],
  equippedBuffDescription: "Increases resistance, magic resistance and max health by 15% respectively",
};
