import { IEquippableLightArmorTier11Blueprint } from "@providers/item/data/types/TierBlueprintTypes";
import {
  BasicAttribute,
  CharacterAttributes,
  CharacterBuffDurationType,
  CharacterBuffType,
  ItemSlotType,
  ItemSubType,
  ItemType,
} from "@rpg-engine/shared";
import { LegsBlueprint } from "../../../types/itemsBlueprintTypes";

export const itemIvoryMoonLegs: IEquippableLightArmorTier11Blueprint = {
  key: LegsBlueprint.IvoryMoonLegs,
  type: ItemType.Armor,
  subType: ItemSubType.Legs,
  textureAtlas: "items",
  texturePath: "legs/ivory-moon-legs.png",
  name: "Ivory Moon Legs",
  description: "Bathed in lunar magic, these legs gleam with an ethereal glow.",
  weight: 0.9,
  defense: 60,
  tier: 11,
  allowedEquipSlotType: [ItemSlotType.Legs],
  equippedBuff: [
    {
      type: CharacterBuffType.CharacterAttribute,
      trait: CharacterAttributes.Speed,
      buffPercentage: 10,
      durationType: CharacterBuffDurationType.Permanent,
      options: {
        messages: {
          activation: "You feel the power of speed and quickness flowing through your body. (+10% speed)",
          deactivation: "You feel the power of speed and quickness leaving your body. (-10% speed)",
        },
      },
    },
    {
      type: CharacterBuffType.Skill,
      trait: BasicAttribute.Strength,
      buffPercentage: 10,
      durationType: CharacterBuffDurationType.Permanent,
      options: {
        messages: {
          activation: "You feel the strength and fortitude coursing through your body. (+10% strength)",
          deactivation: "You feel the strength and fortitude coursing leaving through your body. (-10% strength)",
        },
      },
    },
  ],
  equippedBuffDescription: "Increases speed by 10% and strength by 10% respectively",
};
