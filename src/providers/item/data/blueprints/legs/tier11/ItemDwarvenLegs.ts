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

export const itemDwarvenLegs: IEquippableLightArmorTier11Blueprint = {
  key: LegsBlueprint.DwarvenLegs,
  type: ItemType.Armor,
  subType: ItemSubType.Legs,
  textureAtlas: "items",
  texturePath: "legs/dwarven-legs.png",
  name: "Dwarven Legs",
  description: "Forged deep within the mountain halls, these legs bear the sturdy craftsmanship of the dwarves.",
  weight: 0.5,
  defense: 63,
  tier: 11,
  allowedEquipSlotType: [ItemSlotType.Legs],
  equippedBuff: [
    {
      type: CharacterBuffType.CharacterAttribute,
      trait: CharacterAttributes.Speed,
      buffPercentage: 8,
      durationType: CharacterBuffDurationType.Permanent,
      options: {
        messages: {
          activation: "You feel the power of speed and quickness flowing through your body. (+8% speed)",
          deactivation: "You feel the power of speed and quickness leaving your body. (-8% speed)",
        },
      },
    },
    {
      type: CharacterBuffType.Skill,
      trait: BasicAttribute.Strength,
      buffPercentage: 7,
      durationType: CharacterBuffDurationType.Permanent,
      options: {
        messages: {
          activation: "You feel the strength and fortitude coursing through your body. (+7% strength)",
          deactivation: "You feel the strength and fortitude coursing leaving through your body. (-7% strength)",
        },
      },
    },
  ],
  equippedBuffDescription: "Increases speed by 8% and strength by 7% respectively",
};
