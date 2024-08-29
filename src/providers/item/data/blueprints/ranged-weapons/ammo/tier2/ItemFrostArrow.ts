import { EntityEffectBlueprint } from "@providers/entityEffects/data/types/entityEffectBlueprintTypes";
import { IEquippableAmmoTier2Blueprint } from "@providers/item/data/types/TierBlueprintTypes";
import { ItemSlotType, ItemSubType, ItemType } from "@rpg-engine/shared";
import { RangedWeaponsBlueprint } from "../../../../types/itemsBlueprintTypes";

export const itemFrostArrow: IEquippableAmmoTier2Blueprint = {
  key: RangedWeaponsBlueprint.FrostArrow,
  type: ItemType.Weapon,
  subType: ItemSubType.Ranged,
  textureAtlas: "items",
  texturePath: "ranged-weapons/frost-arrow.png",
  name: "Frost Arrow",
  description: "An arrow infused with icy energy, chilling enemies on impact.",
  attack: 21,
  tier: 2,
  weight: 0.1,
  allowedEquipSlotType: [ItemSlotType.Accessory],
  maxStackSize: 9999,
  basePrice: 10,
  entityEffects: [EntityEffectBlueprint.Freezing],
  entityEffectChance: 80,
  canSell: false,
};
