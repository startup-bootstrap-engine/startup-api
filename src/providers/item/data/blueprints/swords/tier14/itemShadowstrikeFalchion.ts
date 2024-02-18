import { IEquippableMeleeTier14WeaponBlueprint } from "@providers/item/data/types/TierBlueprintTypes";
import { EntityAttackType, ItemSlotType, ItemSubType, ItemType } from "@rpg-engine/shared";
import { SwordsBlueprint } from "../../../types/itemsBlueprintTypes";

export const itemShadowstrikeFalchion: IEquippableMeleeTier14WeaponBlueprint = {
  key: SwordsBlueprint.ShadowstrikeFalchion,
  type: ItemType.Weapon,
  subType: ItemSubType.Sword,
  textureAtlas: "items",
  texturePath: "swords/shadowstrike-falchion.png",
  name: "Shadowstrike Falchion",
  description:
    "Born from the depths of darkness, this falchion strikes swiftly from the shadows, delivering fatal blows before enemies realize their peril.",
  attack: 105,
  defense: 85,
  tier: 14,
  weight: 1.4,
  allowedEquipSlotType: [ItemSlotType.LeftHand, ItemSlotType.RightHand],
  rangeType: EntityAttackType.Melee,
  basePrice: 230,
};
