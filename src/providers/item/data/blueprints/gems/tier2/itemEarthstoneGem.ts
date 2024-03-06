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

export const itemEarthstoneGem: IEquippableArmorTier2Blueprint = {
  key: GemsBlueprint.EarthstoneGem,
  type: ItemType.Jewelry,
  subType: ItemSubType.Gem,
  textureAtlas: "items",
  texturePath: "gems/earthstone-gem.png",
  name: "Earthstone Gem",
  description: "Nature's embrace, earthly hues, timeless energy; a grounding and enchanting essence in gem form.",
  defense: 18,
  tier: 2,
  weight: 2,
  allowedEquipSlotType: [ItemSlotType.Accessory],
  basePrice: 70,
  equippedBuff: {
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
  equippedBuffDescription: "Increases strength by 5%",
};
