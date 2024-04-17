import { IEquippableLightArmorTier9Blueprint } from "@providers/item/data/types/TierBlueprintTypes";
import {
  CharacterAttributes,
  CharacterBuffDurationType,
  CharacterBuffType,
  ItemSlotType,
  ItemSubType,
  ItemType,
} from "@rpg-engine/shared";
import { LegsBlueprint } from "../../../types/itemsBlueprintTypes";

export const itemHoneyGlowLegs: IEquippableLightArmorTier9Blueprint = {
  key: LegsBlueprint.HoneyGlowLegs,
  type: ItemType.Armor,
  subType: ItemSubType.Legs,
  textureAtlas: "items",
  texturePath: "legs/honey-glow-legs.png",
  name: "Honey Glow Legs",
  description: "Coated with a golden sheen, they offer a sweet allure and a touch of magic.",
  weight: 0.5,
  defense: 47,
  tier: 9,
  allowedEquipSlotType: [ItemSlotType.Legs],
  equippedBuff: {
    type: CharacterBuffType.CharacterAttribute,
    trait: CharacterAttributes.Speed,
    buffPercentage: 3,
    durationType: CharacterBuffDurationType.Permanent,
    options: {
      messages: {
        activation: "You feel the power of speed and quickness flowing through your body. (+3% speed)",
        deactivation: "You feel the power of speed and quickness leaving your body. (-3% speed)",
      },
    },
  },
  equippedBuffDescription: "Increases speed by 3%",
};
