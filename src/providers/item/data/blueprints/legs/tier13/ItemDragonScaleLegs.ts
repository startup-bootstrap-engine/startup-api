import { IEquippableLightArmorTier13Blueprint } from "@providers/item/data/types/TierBlueprintTypes";
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

export const itemDragonScaleLegs: IEquippableLightArmorTier13Blueprint = {
  key: LegsBlueprint.DragonScaleLegs,
  type: ItemType.Armor,
  subType: ItemSubType.Legs,
  textureAtlas: "items",
  texturePath: "legs/dragon-scale-legs.png",
  name: "Dragon Scale Legs",
  description: "Crafted from the scales of a mighty dragon, they offer unparalleled protection.",
  weight: 0.8,
  defense: 72,
  tier: 13,
  allowedEquipSlotType: [ItemSlotType.Legs],
  equippedBuff: [
    {
      type: CharacterBuffType.CharacterAttribute,
      trait: CharacterAttributes.Speed,
      buffPercentage: 22,
      durationType: CharacterBuffDurationType.Permanent,
      options: {
        messages: {
          activation: "You feel the power of speed and quickness flowing through your body. (+22% speed)",
          deactivation: "You feel the power of speed and quickness leaving your body. (-22% speed)",
        },
      },
    },
    {
      type: CharacterBuffType.Skill,
      trait: BasicAttribute.Strength,
      buffPercentage: 12,
      durationType: CharacterBuffDurationType.Permanent,
      options: {
        messages: {
          activation: "You feel the strength and fortitude coursing through your body. (+12% strength)",
          deactivation: "You feel the strength and fortitude coursing leaving through your body. (-12% strength)",
        },
      },
    },
  ],
  equippedBuffDescription: "Increases speed by 22% and strength by 12% respectively",
};
