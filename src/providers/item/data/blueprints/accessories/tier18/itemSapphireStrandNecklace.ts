import { IEquippableAccessoryTier18Blueprint } from "@providers/item/data/types/TierBlueprintTypes";
import {
  CharacterAttributes,
  CharacterBuffDurationType,
  CharacterBuffType,
  ItemSlotType,
  ItemSubType,
  ItemType,
} from "@rpg-engine/shared";
import { AccessoriesBlueprint } from "../../../types/itemsBlueprintTypes";

export const itemSapphireStrandNecklace: IEquippableAccessoryTier18Blueprint = {
  key: AccessoriesBlueprint.SapphireStrandNecklace,
  type: ItemType.Accessory,
  subType: ItemSubType.Accessory,
  textureAtlas: "items",
  texturePath: "accessories/sapphire-strand-necklace.png",
  name: "Sapphire Strand Necklace",
  description: "Azure brilliance, reflecting wisdom and tranquility, a token of serenity and insight.",
  attack: 57,
  defense: 57,
  tier: 18,
  weight: 0.3,
  allowedEquipSlotType: [ItemSlotType.Neck],
  basePrice: 31000,
  equippedBuff: {
    type: CharacterBuffType.CharacterAttribute,
    trait: CharacterAttributes.MaxHealth,
    buffPercentage: 6,
    durationType: CharacterBuffDurationType.Permanent,
    options: {
      messages: {
        activation: "You feel the power of max health flowing through your body. (+6% MaxHealth)",
        deactivation: "You feel the power of max health leaving your body. (-6% MaxHealth)",
      },
    },
  },
  equippedBuffDescription: "Increases max health by 6% respectively",
};
