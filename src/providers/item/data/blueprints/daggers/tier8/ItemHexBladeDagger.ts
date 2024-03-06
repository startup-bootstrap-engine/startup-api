import { EntityEffectBlueprint } from "@providers/entityEffects/data/types/entityEffectBlueprintTypes";
import { IEquippableMeleeTier8WeaponBlueprint } from "@providers/item/data/types/TierBlueprintTypes";
import {
  BasicAttribute,
  CharacterBuffDurationType,
  CharacterBuffType,
  EntityAttackType,
  ItemSlotType,
  ItemSubType,
  ItemType,
} from "@rpg-engine/shared";
import { DaggersBlueprint } from "../../../types/itemsBlueprintTypes";

export const itemHexBladeDagger: IEquippableMeleeTier8WeaponBlueprint = {
  key: DaggersBlueprint.HexBladeDagger,
  type: ItemType.Weapon,
  subType: ItemSubType.Dagger,
  textureAtlas: "items",
  texturePath: "daggers/hex-blade-dagger.png",
  name: "Hex Blade Dagger",
  description: "Infused with dark magic, anyone cut by this dagger experiences intense, unexplainable fear.",
  weight: 1.2,
  allowedEquipSlotType: [ItemSlotType.LeftHand, ItemSlotType.RightHand],
  attack: 63,
  defense: 58,
  tier: 8,
  rangeType: EntityAttackType.Melee,
  basePrice: 72,
  entityEffects: [EntityEffectBlueprint.Bleeding],
  entityEffectChance: 85,
  equippedBuff: {
    type: CharacterBuffType.Skill,
    trait: BasicAttribute.Resistance,
    buffPercentage: 7,
    durationType: CharacterBuffDurationType.Permanent,
    options: {
      messages: {
        activation: "You feel the power of resistance flowing through your body. (+7% resistance)",
        deactivation: "You feel the power of resistance leaving your body. (-7% resistance)",
      },
    },
  },
  equippedBuffDescription: "Increases resistance by 7%",
};
