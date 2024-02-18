import { IEquippableMeleeTier15WeaponBlueprint } from "@providers/item/data/types/TierBlueprintTypes";
import { EntityAttackType, ItemSlotType, ItemSubType, ItemType } from "@rpg-engine/shared";
import { SwordsBlueprint } from "../../../types/itemsBlueprintTypes";

export const itemMoonshadowBlade: IEquippableMeleeTier15WeaponBlueprint = {
  key: SwordsBlueprint.MoonshadowBlade,
  type: ItemType.Weapon,
  subType: ItemSubType.Sword,
  textureAtlas: "items",
  texturePath: "swords/moonshadow-blade.png",
  name: "Moonshadow Blade",
  description:
    "Bathed in the eerie light of moonshadow, this blade moves with ghostly grace, cutting through darkness with ethereal precision.",
  attack: 110,
  defense: 90,
  tier: 15,
  weight: 1.4,
  allowedEquipSlotType: [ItemSlotType.LeftHand, ItemSlotType.RightHand],
  rangeType: EntityAttackType.Melee,
  basePrice: 230,
};
