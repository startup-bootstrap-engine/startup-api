import {
  CharacterAttributes,
  CharacterBuffDurationType,
  CharacterBuffType,
  ItemSlotType,
  ItemSubType,
  ItemType,
} from "@rpg-engine/shared";
import { IEquippableLightArmorTier2Blueprint } from "../../../types/TierBlueprintTypes";
import { HelmetsBlueprint } from "../../../types/itemsBlueprintTypes";

export const itemDarkWizardHat: IEquippableLightArmorTier2Blueprint = {
  key: HelmetsBlueprint.DarkWizardHat,
  type: ItemType.Armor,
  subType: ItemSubType.Helmet,
  textureAtlas: "items",
  texturePath: "helmets/dark-wizard-hat.png",
  name: "Dark Wizard Hat",
  description: "Black mage hide their faces in the shadows of their Black  Hats.",
  defense: 8,
  tier: 2,
  weight: 0.5,
  allowedEquipSlotType: [ItemSlotType.Head],
  basePrice: 37,
  equippedBuff: [
    {
      type: CharacterBuffType.CharacterAttribute,
      trait: CharacterAttributes.MaxMana,
      buffPercentage: 4,
      durationType: CharacterBuffDurationType.Permanent,
    },
  ],
  equippedBuffDescription: "Increases max mana by 4%",
};
