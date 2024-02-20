import { IEquippableAccessoryTier28Blueprint } from "@providers/item/data/types/TierBlueprintTypes";
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

export const itemMoonstoneRing: IEquippableAccessoryTier28Blueprint = {
  key: AccessoriesBlueprint.MoonstoneRing,
  type: ItemType.Accessory,
  subType: ItemSubType.Accessory,
  textureAtlas: "items",
  texturePath: "rings/moonstone-ring.png",
  name: "Moonstone Ring",
  description: "Glowing with lunar mystique, reflecting the ethereal beauty of the night sky's enchantment.",
  attack: 82,
  defense: 75,
  tier: 28,
  weight: 1.3,
  allowedEquipSlotType: [ItemSlotType.Neck],
  basePrice: 39500,
  equippedBuff: [
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
      type: CharacterBuffType.CharacterAttribute,
      trait: CharacterAttributes.MaxHealth,
      buffPercentage: 13,
      durationType: CharacterBuffDurationType.Permanent,
      options: {
        messages: {
          activation: "You feel the power of max health flowing through your body. (+13% MaxHealth)",
          deactivation: "You feel the power of max health leaving your body. (-13% MaxHealth)",
        },
      },
    },
  ],
  equippedBuffDescription: "Increases resistance by 11% and max health by 13% respectively",
};
