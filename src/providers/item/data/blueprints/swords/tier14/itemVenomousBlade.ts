import { IEquippableMeleeTier14WeaponBlueprint } from "@providers/item/data/types/TierBlueprintTypes";
import { EntityAttackType, ItemSlotType, ItemSubType, ItemType } from "@rpg-engine/shared";
import { SwordsBlueprint } from "../../../types/itemsBlueprintTypes";

export const itemVenomousBlade: IEquippableMeleeTier14WeaponBlueprint = {
  key: SwordsBlueprint.VenomousBlade,
  type: ItemType.Weapon,
  subType: ItemSubType.Sword,
  textureAtlas: "items",
  texturePath: "swords/venomous-blade.png",
  name: "Venomous Blade",
  description:
    "Coated in lethal toxins, this blade drips with venom, inflicting deadly poison upon its victims with each slice.",
  attack: 105,
  defense: 87,
  tier: 14,
  weight: 1.5,
  allowedEquipSlotType: [ItemSlotType.LeftHand, ItemSlotType.RightHand],
  rangeType: EntityAttackType.Melee,
  basePrice: 240,
};
