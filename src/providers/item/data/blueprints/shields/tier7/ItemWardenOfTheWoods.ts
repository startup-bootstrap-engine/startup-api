import { IEquippableArmorTier7Blueprint } from "@providers/item/data/types/TierBlueprintTypes";
import {
  BasicAttribute,
  CharacterBuffDurationType,
  CharacterBuffType,
  ItemSlotType,
  ItemSubType,
  ItemType,
} from "@rpg-engine/shared";
import { ShieldsBlueprint } from "../../../types/itemsBlueprintTypes";

export const itemWardenOfTheWoods: IEquippableArmorTier7Blueprint = {
  key: ShieldsBlueprint.WardenOfTheWoods,
  type: ItemType.Armor,
  subType: ItemSubType.Shield,
  textureAtlas: "items",
  texturePath: "shields/warden-of-the-woods.png",
  name: "Warden  Of The Woods",
  description:
    "Made from enchanted wood, this shield restores health over time. Perfect for sustainability in long battles.",
  weight: 1.5,
  defense: 55,
  tier: 7,
  allowedEquipSlotType: [ItemSlotType.LeftHand, ItemSlotType.RightHand],
  equippedBuff: {
    type: CharacterBuffType.Skill,
    trait: BasicAttribute.Resistance,
    buffPercentage: 4,
    durationType: CharacterBuffDurationType.Permanent,
    options: {
      messages: {
        activation: "You feel the power of resistance flowing through your body. (+4% resistance)",
        deactivation: "You feel the power of resistance leaving your body. (-4% resistance)",
      },
    },
  },
  equippedBuffDescription: "Increases resistance by 4%",
};
