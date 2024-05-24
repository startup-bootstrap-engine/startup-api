import { IEquippableMeleeTier12WeaponBlueprint } from "@providers/item/data/types/TierBlueprintTypes";
import { EntityAttackType, ItemSlotType, ItemSubType, ItemType } from "@rpg-engine/shared";
import { AxesBlueprint } from "../../../types/itemsBlueprintTypes";

export const itemShadowedReaver: IEquippableMeleeTier12WeaponBlueprint = {
  key: AxesBlueprint.ShadowedReaver,
  type: ItemType.Weapon,
  subType: ItemSubType.Axe,
  textureAtlas: "items",
  texturePath: "axes/shadowed-reaver.png",
  name: "Shadowed Reaver",
  description: "A sinister axe cloaked in darkness, draining the life force of its victims.",
  weight: 5,
  allowedEquipSlotType: [ItemSlotType.LeftHand, ItemSlotType.RightHand],
  attack: 89,
  defense: 90,
  tier: 12,
  rangeType: EntityAttackType.Melee,
  basePrice: 122,
};
