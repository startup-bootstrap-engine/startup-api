import { IEquippableAccessoryTier25Blueprint } from "@providers/item/data/types/TierBlueprintTypes";
import {
  BasicAttribute,
  CharacterBuffDurationType,
  CharacterBuffType,
  ItemSlotType,
  ItemSubType,
  ItemType,
} from "@rpg-engine/shared";
import { AccessoriesBlueprint } from "../../../types/itemsBlueprintTypes";

export const itemSilverRing: IEquippableAccessoryTier25Blueprint = {
  key: AccessoriesBlueprint.SilverRing,
  type: ItemType.Accessory,
  subType: ItemSubType.Accessory,
  textureAtlas: "items",
  texturePath: "rings/silver-ring.png",
  name: "Silver Ring",
  description:
    "Elegant silver ring gleaming with sophistication, etched with delicate patterns, exuding timeless allure.",
  attack: 76,
  defense: 72,
  tier: 25,
  weight: 1,
  allowedEquipSlotType: [ItemSlotType.Ring],
  basePrice: 37500,
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
