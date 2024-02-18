import { IEquippableMeleeTier14WeaponBlueprint } from "@providers/item/data/types/TierBlueprintTypes";
import { EntityAttackType, ItemSlotType, ItemSubType, ItemType } from "@rpg-engine/shared";
import { SwordsBlueprint } from "../../../types/itemsBlueprintTypes";

export const itemVenomousStinger: IEquippableMeleeTier14WeaponBlueprint = {
  key: SwordsBlueprint.VenomousStinger,
  type: ItemType.Weapon,
  subType: ItemSubType.Sword,
  textureAtlas: "items",
  texturePath: "swords/venomous-stinger.png",
  name: "Venomous Stinger",
  description:
    "Tipped with deadly poison, this stinger-like blade injects venom into its victims, bringing swift and agonizing death.",
  attack: 105,
  defense: 85,
  tier: 14,
  weight: 1.3,
  allowedEquipSlotType: [ItemSlotType.LeftHand, ItemSlotType.RightHand],
  rangeType: EntityAttackType.Melee,
  basePrice: 250,
};
