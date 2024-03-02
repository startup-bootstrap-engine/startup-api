import { IEquippableMeleeTier16WeaponBlueprint } from "@providers/item/data/types/TierBlueprintTypes";
import { EntityAttackType, ItemSlotType, ItemSubType, ItemType } from "@rpg-engine/shared";
import { AxesBlueprint } from "../../../types/itemsBlueprintTypes";

export const itemIroncladCleaver: IEquippableMeleeTier16WeaponBlueprint = {
  key: AxesBlueprint.IroncladCleaver,
  type: ItemType.Weapon,
  subType: ItemSubType.Axe,
  textureAtlas: "items",
  texturePath: "axes/ironclad-cleaver-axe.png",
  name: "Ironclad Cleaver",
  description: "The Ironclad Cleaver axe commands respect with its sharp, imposing presence.",
  weight: 5.6,
  allowedEquipSlotType: [ItemSlotType.LeftHand, ItemSlotType.RightHand],
  attack: 117,
  defense: 115,
  tier: 16,
  rangeType: EntityAttackType.Melee,
  basePrice: 142,
};
