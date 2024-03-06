import {
  BasicAttribute,
  CharacterBuffDurationType,
  CharacterBuffType,
  ItemSlotType,
  ItemSubType,
  ItemType,
} from "@rpg-engine/shared";
import { IEquippableArmorTier2Blueprint } from "../../../types/TierBlueprintTypes";
import { GemsBlueprint } from "../../../types/itemsBlueprintTypes";

export const itemAmethystGem: IEquippableArmorTier2Blueprint = {
  key: GemsBlueprint.AmethystGem,
  type: ItemType.Jewelry,
  subType: ItemSubType.Gem,
  textureAtlas: "items",
  texturePath: "gems/amethyst-gem.png",
  name: "Amethyst Gem",
  description: "Royal purple charm, soothing clarity; a regal and enchanting beauty within this precious stone.",
  defense: 22,
  tier: 2,
  weight: 2,
  allowedEquipSlotType: [ItemSlotType.Accessory],
  basePrice: 80,
  equippedBuff: {
    type: CharacterBuffType.Skill,
    trait: BasicAttribute.Strength,
    buffPercentage: 15,
    durationType: CharacterBuffDurationType.Permanent,
    options: {
      messages: {
        activation: "You feel the strength and fortitude coursing through your body. (+15% strength)",
        deactivation: "You feel the strength and fortitude coursing leaving through your body. (-15% strength)",
      },
    },
  },
  equippedBuffDescription: "Increases strength by 15%",
};
