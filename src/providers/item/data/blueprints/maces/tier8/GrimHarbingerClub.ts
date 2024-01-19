import { IEquippableMeleeTier8WeaponBlueprint } from "@providers/item/data/types/TierBlueprintTypes";
import { EntityAttackType, ItemSlotType, ItemSubType, ItemType } from "@rpg-engine/shared";
import { MacesBlueprint } from "../../../types/itemsBlueprintTypes";

export const itemGrimHarbingerClub: IEquippableMeleeTier8WeaponBlueprint = {
  key: MacesBlueprint.GrimHarbingerClub,
  type: ItemType.Weapon,
  subType: ItemSubType.Mace,
  textureAtlas: "items",
  texturePath: "maces/grim-harbinger-club.png",
  name: "Grim Harbinger Club",
  description:
    "The Grim Harbinger, with its dark hue and formidable design, portends death and destruction in its wake.",
  weight: 4.5,
  allowedEquipSlotType: [ItemSlotType.LeftHand, ItemSlotType.RightHand],
  attack: 60,
  defense: 58,
  tier: 8,
  rangeType: EntityAttackType.Melee,
};
