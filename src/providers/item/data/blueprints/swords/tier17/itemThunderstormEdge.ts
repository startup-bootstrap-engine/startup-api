import { IEquippableMeleeTier17WeaponBlueprint } from "@providers/item/data/types/TierBlueprintTypes";
import { EntityAttackType, ItemSlotType, ItemSubType, ItemType } from "@rpg-engine/shared";
import { SwordsBlueprint } from "../../../types/itemsBlueprintTypes";

export const itemThunderstormEdge: IEquippableMeleeTier17WeaponBlueprint = {
  key: SwordsBlueprint.ThunderstormEdge,
  type: ItemType.Weapon,
  subType: ItemSubType.Sword,
  textureAtlas: "items",
  texturePath: "swords/thunderstorm-edge.png",
  name: "Thunderstorm Edge",
  description:
    "Infused with the power of raging thunderstorms, this edge crackles with electrifying energy, delivering devastating blows with each strike.",
  attack: 127,
  defense: 85,
  tier: 17,
  weight: 1.3,
  allowedEquipSlotType: [ItemSlotType.LeftHand, ItemSlotType.RightHand],
  rangeType: EntityAttackType.Melee,
  basePrice: 250,
};
