import { IEquippableMeleeTier16WeaponBlueprint } from "@providers/item/data/types/TierBlueprintTypes";
import { EntityAttackType, ItemSlotType, ItemSubType, ItemType } from "@rpg-engine/shared";
import { SwordsBlueprint } from "../../../types/itemsBlueprintTypes";

export const itemThunderousClaymore: IEquippableMeleeTier16WeaponBlueprint = {
  key: SwordsBlueprint.ThunderousClaymore,
  type: ItemType.Weapon,
  subType: ItemSubType.Sword,
  textureAtlas: "items",
  texturePath: "swords/thunderous-claymore.png",
  name: "Thunderous Claymore",
  description:
    "Forged in the heart of a thunderstorm, this claymore resonates with the fury of lightning, striking down foes with electrifying force.",
  attack: 120,
  defense: 99,
  tier: 16,
  weight: 1.4,
  allowedEquipSlotType: [ItemSlotType.LeftHand, ItemSlotType.RightHand],
  rangeType: EntityAttackType.Melee,
  basePrice: 270,
};
