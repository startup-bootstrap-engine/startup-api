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

export const itemAzureFrostLegs: IEquippableLightArmorTier10Blueprint = {
  key: LegsBlueprint.AzureFrostLegs,
  type: ItemType.Armor,
  subType: ItemSubType.Legs,
  textureAtlas: "items",
  texturePath: "legs/azure-frost-legs.png",
  name: "Azure Frost Legs",
  description: "Holding the chill of the northern glaciers, they provide coolness even in the heat of battle.",
  weight: 0.6,
  defense: 53,
  tier: 10,
  allowedEquipSlotType: [ItemSlotType.Legs],
  equippedBuff: [
    {
      type: CharacterBuffType.CharacterAttribute,
      trait: CharacterAttributes.Speed,
      buffPercentage: 5,
      durationType: CharacterBuffDurationType.Permanent,
      options: {
        messages: {
          activation: "You feel the power of speed and quickness flowing through your body. (+5% speed)",
          deactivation: "You feel the power of speed and quickness leaving your body. (-5% speed)",
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
  equippedBuffDescription: "Increases speed by 5% and strength by 5% respectively",
};
