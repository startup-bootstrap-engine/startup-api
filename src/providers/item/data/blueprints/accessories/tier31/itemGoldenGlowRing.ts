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

export const itemGoldenGlowRing: IEquippableAccessoryTier31Blueprint = {
  key: AccessoriesBlueprint.GoldenGlowRing,
  type: ItemType.Accessory,
  subType: ItemSubType.Accessory,
  textureAtlas: "items",
  texturePath: "rings/golden-glow-ring.png",
  name: "Golden Glow Ring",
  description: "Bathed in luminescence, emanating warmth, prosperity, and the promise of new horizons.",
  attack: 90,
  defense: 85,
  tier: 31,
  weight: 1.5,
  allowedEquipSlotType: [ItemSlotType.Ring],
  basePrice: 41000,
  equippedBuff: [
    {
      type: CharacterBuffType.Skill,
      trait: BasicAttribute.Resistance,
      buffPercentage: 14,
      durationType: CharacterBuffDurationType.Permanent,
      options: {
        messages: {
          activation: "You feel the power of resistance flowing through your body. (+14% resistance)",
          deactivation: "You feel the power of resistance leaving your body. (-14% resistance)",
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
  equippedBuffDescription: "Increases resistance by 14% and max health by 12% respectively",
};
