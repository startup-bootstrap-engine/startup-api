import { IEquippableAccessoryTier22Blueprint } from "@providers/item/data/types/TierBlueprintTypes";
import {
  BasicAttribute,
  CharacterBuffDurationType,
  CharacterBuffType,
  ItemSlotType,
  ItemSubType,
  ItemType,
} from "@rpg-engine/shared";
import { AccessoriesBlueprint } from "../../../types/itemsBlueprintTypes";

export const itemEmberglowNecklace: IEquippableAccessoryTier22Blueprint = {
  key: AccessoriesBlueprint.EmberglowNecklace,
  type: ItemType.Accessory,
  subType: ItemSubType.Accessory,
  textureAtlas: "items",
  texturePath: "accessories/emberglow-necklace.png",
  name: "Emberglow Necklace",
  description: "Radiating warmth, echoing the flickering flames, a beacon of courage and inner strength.",
  attack: 69,
  defense: 69,
  tier: 22,
  weight: 0.7,
  allowedEquipSlotType: [ItemSlotType.Neck],
  basePrice: 34800,
  equippedBuff: {
    type: CharacterBuffType.Skill,
    trait: BasicAttribute.Strength,
    buffPercentage: 8,
    durationType: CharacterBuffDurationType.Permanent,
    options: {
      messages: {
        activation: "You feel the strength and fortitude coursing through your body. (+8% strength)",
        deactivation: "You feel the strength and fortitude coursing leaving through your body. (-8% strength)",
      },
    },
  },
  equippedBuffDescription: "Increases strength by 8%",
};
