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
import { HammersBlueprint } from "../../../types/itemsBlueprintTypes";

export const itemThorHammer: IEquippableMeleeTier8WeaponBlueprint = {
  key: HammersBlueprint.ThorHammer,
  type: ItemType.Weapon,
  subType: ItemSubType.Mace,
  textureAtlas: "items",
  texturePath: "hammers/thor-hammer.png",
  name: "Thor Hammer",
  description:
    "A mythical hammer endowed with the power of thunder and lightning, often requiring worthiness to wield.",
  weight: 1.2,
  allowedEquipSlotType: [ItemSlotType.LeftHand, ItemSlotType.RightHand],
  attack: 62,
  defense: 38,
  tier: 8,
  rangeType: EntityAttackType.Melee,
  entityEffects: [EntityEffectBlueprint.Poison],
  entityEffectChance: 85,
  equippedBuff: {
    type: CharacterBuffType.Skill,
    trait: BasicAttribute.Strength,
    buffPercentage: 5,
    durationType: CharacterBuffDurationType.Permanent,
    options: {
      messages: {
        activation: "You feel the strength and fortitude coursing through your body. (+5% strength)",
        deactivation: "You feel the strength and fortitude coursing leaving through your body. (-5% strength)",
      },
    },
  },
  equippedBuffDescription: "Increases strength by 5%",
};
