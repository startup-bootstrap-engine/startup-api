import {
  BasicAttribute,
  CharacterBuffDurationType,
  CharacterBuffType,
  EntityAttackType,
  ItemSlotType,
  ItemSubType,
  ItemType,
} from "@rpg-engine/shared";
import { IEquippableTwoHandedTier4WeaponBlueprint } from "../../../types/TierBlueprintTypes";
import { SpearsBlueprint } from "../../../types/itemsBlueprintTypes";
import { EntityEffectBlueprint } from "@providers/entityEffects/data/types/entityEffectBlueprintTypes";

export const itemPoseidonTrident: IEquippableTwoHandedTier4WeaponBlueprint = {
  key: SpearsBlueprint.PoseidonTrident,
  type: ItemType.Weapon,
  subType: ItemSubType.Spear,
  textureAtlas: "items",
  texturePath: "spears/poseidon-trident.png",
  name: "Poseidon Trident",
  description:
    "The Poseidon Trident is a three-pronged spear-like weapon with a long handle and sharp, pointed prongs. The weapon is named after the Greek god of the sea, and its design is inspired by his weapon of choice. The tridents prongs are razor-sharp, capable of piercing through armor and dealing devastating blows to enemies.",
  weight: 3.8,
  allowedEquipSlotType: [ItemSlotType.LeftHand, ItemSlotType.RightHand],
  attack: 68,
  defense: 36,
  tier: 4,
  rangeType: EntityAttackType.Melee,
  basePrice: 75,
  isTwoHanded: true,
  entityEffects: [EntityEffectBlueprint.Poison],
  entityEffectChance: 90,
  equippedBuff: {
    type: CharacterBuffType.Skill,
    trait: BasicAttribute.MagicResistance,
    buffPercentage: 5,
    durationType: CharacterBuffDurationType.Permanent,
    options: {
      messages: {
        activation: "You feel the power of magic resistance flowing through your body. (+5% magic resistance)",
        deactivation: "You feel the power of magic resistance leaving your body. (-5% magic resistance)",
      },
    },
  },
  equippedBuffDescription: "Increases magic resistance by 5%",
};
