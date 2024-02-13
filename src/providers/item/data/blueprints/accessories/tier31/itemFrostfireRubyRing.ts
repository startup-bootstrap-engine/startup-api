import { IEquippableAccessoryTier31Blueprint } from "@providers/item/data/types/TierBlueprintTypes";
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

export const itemFrostfireRubyRing: IEquippableAccessoryTier31Blueprint = {
  key: AccessoriesBlueprint.FrostfireRubyRing,
  type: ItemType.Accessory,
  subType: ItemSubType.Accessory,
  textureAtlas: "items",
  texturePath: "rings/frostfire-ruby-ring.png",
  name: "Frostfire Ruby Ring",
  description: "Blazing with icy flames, a fusion of elemental power and enchanting beauty.",
  attack: 92,
  defense: 87,
  tier: 31,
  weight: 1.5,
  allowedEquipSlotType: [ItemSlotType.Neck],
  basePrice: 42000,
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
      trait: CharacterAttributes.Speed,
      buffPercentage: 13,
      durationType: CharacterBuffDurationType.Permanent,
      options: {
        messages: {
          activation: "You feel the power of speed and quickness flowing through your body. (+13% speed)",
          deactivation: "You feel the power of speed and quickness leaving your body. (-13% speed)",
        },
      },
    },
  ],
  equippedBuffDescription: "Increases resistance by 12% and speed by 13% respectively",
};
