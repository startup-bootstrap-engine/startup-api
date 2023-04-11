import { ItemSlotType, ItemSubType, ItemType } from "@rpg-engine/shared";
import { IEquippableAccessoryTier2Blueprint } from "../../../types/TierBlueprintTypes";
import { AccessoriesBlueprint } from "../../../types/itemsBlueprintTypes";

export const itemJadeRing: IEquippableAccessoryTier2Blueprint = {
  key: AccessoriesBlueprint.JadeRing,
  type: ItemType.Accessory,
  subType: ItemSubType.Accessory,
  textureAtlas: "items",
  texturePath: "rings/jade-ring.png",
  name: "Jade Ring",
  description:
    "A beautiful and precious ring made of jade, a green gemstone prized for its clarity and luster. It is believed to bring good luck and prosperity to its wearer.",
  attack: 7,
  defense: 7,
  tier: 2,
  weight: 0.1,
  allowedEquipSlotType: [ItemSlotType.Ring],
  basePrice: 60,
};