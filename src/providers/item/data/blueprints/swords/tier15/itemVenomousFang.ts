import { IEquippableMeleeTier15WeaponBlueprint } from "@providers/item/data/types/TierBlueprintTypes";
import { EntityAttackType, ItemSlotType, ItemSubType, ItemType } from "@rpg-engine/shared";
import { SwordsBlueprint } from "../../../types/itemsBlueprintTypes";

export const itemVenomousFang: IEquippableMeleeTier15WeaponBlueprint = {
  key: SwordsBlueprint.VenomousFang,
  type: ItemType.Weapon,
  subType: ItemSubType.Sword,
  textureAtlas: "items",
  texturePath: "swords/venomous-fang.png",
  name: "Venomous Fang",
  description:
    "Coated with deadly venom, this fang-like blade delivers a swift and lethal strike, leaving foes writhing in agony from its toxic bite.",
  attack: 108,
  defense: 75,
  tier: 15,
  weight: 1.2,
  allowedEquipSlotType: [ItemSlotType.LeftHand, ItemSlotType.RightHand],
  rangeType: EntityAttackType.Melee,
  basePrice: 200,
};
