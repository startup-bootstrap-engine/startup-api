import { IEquippableMeleeTier18WeaponBlueprint } from "@providers/item/data/types/TierBlueprintTypes";
import { EntityAttackType, ItemSlotType, ItemSubType, ItemType } from "@rpg-engine/shared";
import { SwordsBlueprint } from "../../../types/itemsBlueprintTypes";

export const itemCelestialDefender: IEquippableMeleeTier18WeaponBlueprint = {
  key: SwordsBlueprint.CelestialDefender,
  type: ItemType.Weapon,
  subType: ItemSubType.Sword,
  textureAtlas: "items",
  texturePath: "swords/celestial-defender.png",
  name: "Celestial Defender",
  description:
    "Blessed by celestial guardians, this defender radiates a protective aura, shielding its wielder from harm in the darkest of times.",
  attack: 130,
  defense: 90,
  tier: 18,
  weight: 1.2,
  allowedEquipSlotType: [ItemSlotType.LeftHand, ItemSlotType.RightHand],
  rangeType: EntityAttackType.Melee,
  basePrice: 220,
};
