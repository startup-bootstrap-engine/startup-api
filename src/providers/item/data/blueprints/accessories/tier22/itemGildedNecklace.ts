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

export const itemGildedNecklace: IEquippableAccessoryTier22Blueprint = {
  key: AccessoriesBlueprint.GildedNecklace,
  type: ItemType.Accessory,
  subType: ItemSubType.Accessory,
  textureAtlas: "items",
  texturePath: "accessories/gilded-necklace.png",
  name: "Gilded Necklace",
  description: "Luxurious adornment, shimmering with opulence, a symbol of wealth, status, and refined elegance.",
  attack: 67,
  defense: 67,
  tier: 22,
  weight: 0.7,
  allowedEquipSlotType: [ItemSlotType.Neck],
  basePrice: 34500,
  equippedBuff: {
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
  equippedBuffDescription: "Increases strength by 10%",
};
