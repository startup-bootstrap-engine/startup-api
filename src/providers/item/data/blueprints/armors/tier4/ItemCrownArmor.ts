import { ItemSlotType, ItemSubType, ItemType } from "@rpg-engine/shared";
import { IEquippableArmorTier4Blueprint } from "../../../types/TierBlueprintTypes";
import { ArmorsBlueprint } from "../../../types/itemsBlueprintTypes";

export const itemCrownArmor: IEquippableArmorTier4Blueprint = {
  key: ArmorsBlueprint.CrownArmor,
  type: ItemType.Armor,
  subType: ItemSubType.Armor,
  textureAtlas: "items",
  texturePath: "armors/crown-armor.png",
  name: "Crown Armor",
  description:
    "This enchanted armor is said to have been created by ancient kings and queens, imbuing it with the power and majesty of royalty.",
  defense: 34,
  tier: 4,
  weight: 3,
  allowedEquipSlotType: [ItemSlotType.Torso],
  basePrice: 200,
};