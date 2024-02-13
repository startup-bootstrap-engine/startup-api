import { IEquippableAccessoryTier18Blueprint } from "@providers/item/data/types/TierBlueprintTypes";
import {
  CharacterAttributes,
  CharacterBuffDurationType,
  CharacterBuffType,
  ItemSlotType,
  ItemSubType,
  ItemType,
} from "@rpg-engine/shared";
import { AccessoriesBlueprint } from "../../../types/itemsBlueprintTypes";

export const itemEarthstoneEmeraldNecklace: IEquippableAccessoryTier18Blueprint = {
  key: AccessoriesBlueprint.EarthstoneEmeraldNecklace,
  type: ItemType.Accessory,
  subType: ItemSubType.Accessory,
  textureAtlas: "items",
  texturePath: "accessories/earthstone-emerald-necklace.png",
  name: "Earthstone Emerald Necklace",
  description: "A verdant gem imbued with nature's essence, granting vitality and resilience.",
  attack: 55,
  defense: 55,
  tier: 18,
  weight: 0.3,
  allowedEquipSlotType: [ItemSlotType.Neck],
  basePrice: 30100,
  equippedBuff: {
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
  equippedBuffDescription: "Increases speed by 12%",
};
