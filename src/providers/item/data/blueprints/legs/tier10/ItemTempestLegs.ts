import { IEquippableLightArmorTier10Blueprint } from "@providers/item/data/types/TierBlueprintTypes";
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

export const itemTempestLegs: IEquippableLightArmorTier10Blueprint = {
  key: LegsBlueprint.TempestLegs,
  type: ItemType.Armor,
  subType: ItemSubType.Legs,
  textureAtlas: "items",
  texturePath: "legs/tempest-legs.png",
  name: "Tempest Legs",
  description: "Whispers of storms and winds are held within, allowing swift movements.",
  weight: 0.5,
  defense: 56,
  tier: 10,
  allowedEquipSlotType: [ItemSlotType.Legs],
  equippedBuff: [
    {
      type: CharacterBuffType.CharacterAttribute,
      trait: CharacterAttributes.Speed,
      buffPercentage: 6,
      durationType: CharacterBuffDurationType.Permanent,
      options: {
        messages: {
          activation: "You feel the power of speed and quickness flowing through your body. (+6% speed)",
          deactivation: "You feel the power of speed and quickness leaving your body. (-6% speed)",
        },
      },
    },
    {
      type: CharacterBuffType.Skill,
      trait: BasicAttribute.Strength,
      buffPercentage: 5,
      durationType: CharacterBuffDurationType.Permanent,
      options: {
        messages: {
          activation: "You feel the strength and fortitude coursing through your body. (+5% strength)",
          deactivation: "You feel the strength and fortitude coursing leaving through your body. (-5% strength)",
        },
      },
    },
  ],
  equippedBuffDescription: "Increases speed by 6% and strength by 5% respectively",
};
