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

export const itemScarletNecklace: IEquippableAccessoryTier24Blueprint = {
  key: AccessoriesBlueprint.ScarletNecklace,
  type: ItemType.Accessory,
  subType: ItemSubType.Accessory,
  textureAtlas: "items",
  texturePath: "accessories/scarlet-necklace.png",
  name: "Scarlet Necklace",
  description: "Bold crimson hues, symbolizing passion, courage, and the fiery spirit of adventure.",
  attack: 72,
  defense: 71,
  tier: 24,
  weight: 0.9,
  allowedEquipSlotType: [ItemSlotType.Neck],
  basePrice: 36000,
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
      trait: CharacterAttributes.Speed,
      buffPercentage: 12,
      durationType: CharacterBuffDurationType.Permanent,
      options: {
        messages: {
          activation: "You feel the power of speed and quickness flowing through your body. (+12% speed)",
          deactivation: "You feel the power of speed and quickness leaving your body. (-12% speed)",
        },
      },
    },
  ],
  equippedBuffDescription: "Increases resistance by 10% and speed by 12% respectively",
};
