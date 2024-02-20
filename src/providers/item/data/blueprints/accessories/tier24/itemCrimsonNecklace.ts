import { IEquippableAccessoryTier24Blueprint } from "@providers/item/data/types/TierBlueprintTypes";
import {
  BasicAttribute,
  CharacterAttributes,
  CharacterBuffDurationType,
  CharacterBuffType,
  ItemSlotType,
  ItemSubType,
  ItemType,
} from "@rpg-engine/shared";
import { AccessoriesBlueprint } from "../../../types/itemsBlueprintTypes";

export const itemCrimsonNecklace: IEquippableAccessoryTier24Blueprint = {
  key: AccessoriesBlueprint.CrimsonNecklace,
  type: ItemType.Accessory,
  subType: ItemSubType.Accessory,
  textureAtlas: "items",
  texturePath: "accessories/crimson-necklace.png",
  name: "Crimson Necklace",
  description: "Radiant red, embodying passion, vitality, and the daring spirit of those who wear it.",
  attack: 73,
  defense: 71,
  tier: 24,
  weight: 0.9,
  allowedEquipSlotType: [ItemSlotType.Neck],
  basePrice: 36500,
  equippedBuff: [
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
      type: CharacterBuffType.CharacterAttribute,
      trait: CharacterAttributes.MaxHealth,
      buffPercentage: 12,
      durationType: CharacterBuffDurationType.Permanent,
      options: {
        messages: {
          activation: "You feel the power of max health flowing through your body. (+12% MaxHealth)",
          deactivation: "You feel the power of max health leaving your body. (-12% MaxHealth)",
        },
      },
    },
  ],
  equippedBuffDescription: "Increases resistance by 10% and max health by 12% respectively",
};
