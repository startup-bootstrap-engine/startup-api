import {
  BasicAttribute,
  CharacterBuffDurationType,
  CharacterBuffType,
  ItemSlotType,
  ItemSubType,
  ItemType,
} from "@rpg-engine/shared";
import { IEquippableLightArmorTier5Blueprint } from "../../../types/TierBlueprintTypes";
import { HelmetsBlueprint } from "../../../types/itemsBlueprintTypes";

export const itemYellowEnchanterHat: IEquippableLightArmorTier5Blueprint = {
  key: HelmetsBlueprint.YellowEnchanterHat,
  type: ItemType.Armor,
  subType: ItemSubType.Helmet,
  textureAtlas: "items",
  texturePath: "helmets/yellow-enchanter-hat.png",
  name: "Yellow Enchanter Hat",
  description: "A hat known for enhancing the power of enchantments",
  defense: 26,
  tier: 5,
  weight: 3.2,
  allowedEquipSlotType: [ItemSlotType.Head],
  basePrice: 100,
  equippedBuff: [
    {
      type: CharacterBuffType.Skill,
      trait: BasicAttribute.Strength,
      buffPercentage: 10,
      durationType: CharacterBuffDurationType.Permanent,
      options: {
        messages: {
          activation: "You feel the power of strength flowing through your body. (+10% strength)",
          deactivation: "You feel the power of strength leaving your body. (-10% strength)",
        },
      },
    },
    {
      type: CharacterBuffType.Skill,
      trait: BasicAttribute.Resistance,
      buffPercentage: 10,
      durationType: CharacterBuffDurationType.Permanent,
      options: {
        messages: {
          activation: "You feel the power of resistance flowing through your body. (+10% resistance)",
          deactivation: "You feel the power of resistance leaving your body. (-10% resistance)",
        },
      },
    },
  ],
  equippedBuffDescription: "Increases strength by 10% and resistance by 10% respectively",
};
