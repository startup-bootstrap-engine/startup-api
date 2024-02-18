import { IEquippableMeleeTier17WeaponBlueprint } from "@providers/item/data/types/TierBlueprintTypes";
import { EntityAttackType, ItemSlotType, ItemSubType, ItemType } from "@rpg-engine/shared";
import { SwordsBlueprint } from "../../../types/itemsBlueprintTypes";

export const itemMoonlightCrescent: IEquippableMeleeTier17WeaponBlueprint = {
  key: SwordsBlueprint.MoonlightCrescent,
  type: ItemType.Weapon,
  subType: ItemSubType.Sword,
  textureAtlas: "items",
  texturePath: "swords/moonlight-crescent.png",
  name: "Moonlight Crescent",
  description:
    "Bathed in the glow of the moon, this crescent-shaped blade dances through the darkness, slicing through enemies with ethereal grace.",
  attack: 123,
  defense: 95,
  tier: 17,
  weight: 1.3,
  allowedEquipSlotType: [ItemSlotType.LeftHand, ItemSlotType.RightHand],
  rangeType: EntityAttackType.Melee,
  basePrice: 240,
};
