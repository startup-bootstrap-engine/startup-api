import { IEquippableAccessoryTier29Blueprint } from "@providers/item/data/types/TierBlueprintTypes";
import {
  BasicAttribute,
  CharacterBuffDurationType,
  CharacterBuffType,
  ItemSlotType,
  ItemSubType,
  ItemType,
} from "@rpg-engine/shared";
import { AccessoriesBlueprint } from "../../../types/itemsBlueprintTypes";

export const itemCherryRing: IEquippableAccessoryTier29Blueprint = {
  key: AccessoriesBlueprint.CherryRing,
  type: ItemType.Accessory,
  subType: ItemSubType.Accessory,
  textureAtlas: "items",
  texturePath: "rings/cherry-ring.png",
  name: "Cherry Ring",
  description: "Adorned with delicate blossoms, evoking the sweetness of spring, a symbol of renewal.",
  attack: 85,
  defense: 80,
  tier: 29,
  weight: 1.4,
  allowedEquipSlotType: [ItemSlotType.Ring],
  basePrice: 40000,
  equippedBuff: {
    type: CharacterBuffType.Skill,
    trait: BasicAttribute.Strength,
    buffPercentage: 11,
    durationType: CharacterBuffDurationType.Permanent,
    options: {
      messages: {
        activation: "You feel the strength and fortitude coursing through your body. (+11% strength)",
        deactivation: "You feel the strength and fortitude coursing leaving through your body. (-11% strength)",
      },
    },
  },
  equippedBuffDescription: "Increases strength by 11%",
};
