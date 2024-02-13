import { IEquippableAccessoryTier18Blueprint } from "@providers/item/data/types/TierBlueprintTypes";
import {
  BasicAttribute,
  CharacterBuffDurationType,
  CharacterBuffType,
  ItemSlotType,
  ItemSubType,
  ItemType,
} from "@rpg-engine/shared";
import { AccessoriesBlueprint } from "../../../types/itemsBlueprintTypes";

export const itemRubyNeckles: IEquippableAccessoryTier18Blueprint = {
  key: AccessoriesBlueprint.RubyNeckles,
  type: ItemType.Accessory,
  subType: ItemSubType.Accessory,
  textureAtlas: "items",
  texturePath: "accessories/ruby-neckles.png",
  name: "Ruby Neckles",
  description: "Gleaming crimson gem symbolizing passion, strength, and fiery resolve in the wearer's journey.",
  attack: 56,
  defense: 56,
  tier: 18,
  weight: 0.3,
  allowedEquipSlotType: [ItemSlotType.Neck],
  basePrice: 30500,
  equippedBuff: {
    type: CharacterBuffType.Skill,
    trait: BasicAttribute.Resistance,
    buffPercentage: 8,
    durationType: CharacterBuffDurationType.Permanent,
    options: {
      messages: {
        activation: "You feel the power of resistance flowing through your body. (+8% resistance)",
        deactivation: "You feel the power of resistance leaving your body. (-8% resistance)",
      },
    },
  },
  equippedBuffDescription: "Increases resistance by 8%",
};
