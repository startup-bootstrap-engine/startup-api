import { IEquippableMeleeTier16WeaponBlueprint } from "@providers/item/data/types/TierBlueprintTypes";
import { EntityAttackType, ItemSlotType, ItemSubType, ItemType } from "@rpg-engine/shared";
import { SwordsBlueprint } from "../../../types/itemsBlueprintTypes";

export const itemSeraphicScimitar: IEquippableMeleeTier16WeaponBlueprint = {
  key: SwordsBlueprint.SeraphicScimitar,
  type: ItemType.Weapon,
  subType: ItemSubType.Sword,
  textureAtlas: "items",
  texturePath: "swords/seraphic-scimitar.png",
  name: "Seraphic Scimitar",
  description:
    "Forged by celestial smiths, this scimitar gleams with angelic light, delivering divine justice upon the wicked.",
  attack: 114,
  defense: 85,
  tier: 16,
  weight: 1.2,
  allowedEquipSlotType: [ItemSlotType.LeftHand, ItemSlotType.RightHand],
  rangeType: EntityAttackType.Melee,
  basePrice: 220,
};
