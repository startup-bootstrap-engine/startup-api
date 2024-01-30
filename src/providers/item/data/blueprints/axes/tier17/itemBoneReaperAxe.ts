import { IEquippableMeleeTier17WeaponBlueprint } from "@providers/item/data/types/TierBlueprintTypes";
import { EntityAttackType, ItemSlotType, ItemSubType, ItemType } from "@rpg-engine/shared";
import { AxesBlueprint } from "../../../types/itemsBlueprintTypes";

export const itemBoneReaperAxe: IEquippableMeleeTier17WeaponBlueprint = {
  key: AxesBlueprint.BoneReaperAxe,
  type: ItemType.Weapon,
  subType: ItemSubType.Axe,
  textureAtlas: "items",
  texturePath: "axes/bone-reaper-axe.png",
  name: "Bone Reaper Axe",
  description:
    "A dark, strong, and fearsome battle tool, boasting exceptional craftsmanship and a haunting aura that strikes terror into adversaries.",
  weight: 6.1,
  allowedEquipSlotType: [ItemSlotType.LeftHand, ItemSlotType.RightHand],
  attack: 127,
  defense: 125,
  tier: 17,
  rangeType: EntityAttackType.Melee,
  basePrice: 150,
};
