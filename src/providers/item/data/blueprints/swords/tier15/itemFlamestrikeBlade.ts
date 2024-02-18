import { IEquippableMeleeTier15WeaponBlueprint } from "@providers/item/data/types/TierBlueprintTypes";
import { EntityAttackType, ItemSlotType, ItemSubType, ItemType } from "@rpg-engine/shared";
import { SwordsBlueprint } from "../../../types/itemsBlueprintTypes";

export const itemFlamestrikeBlade: IEquippableMeleeTier15WeaponBlueprint = {
  key: SwordsBlueprint.FlamestrikeBlade,
  type: ItemType.Weapon,
  subType: ItemSubType.Sword,
  textureAtlas: "items",
  texturePath: "swords/flamestrike-blade.png",
  name: "Flamestrike Blade",
  description:
    "Forged within flames, this sword carries the heat of hell, reducing foes to ashes with its fiery strikes.",
  attack: 108,
  defense: 80,
  tier: 15,
  weight: 1.5,
  allowedEquipSlotType: [ItemSlotType.LeftHand, ItemSlotType.RightHand],
  rangeType: EntityAttackType.Melee,
  basePrice: 230,
};
