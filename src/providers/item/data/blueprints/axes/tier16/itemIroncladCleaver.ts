import { EntityEffectBlueprint } from "@providers/entityEffects/data/types/entityEffectBlueprintTypes";
import { IEquippableMeleeTier16WeaponBlueprint } from "@providers/item/data/types/TierBlueprintTypes";
import {
  BasicAttribute,
  CharacterBuffDurationType,
  CharacterBuffType,
  EntityAttackType,
  ItemSlotType,
  ItemSubType,
  ItemType,
} from "@rpg-engine/shared";
import { AxesBlueprint } from "../../../types/itemsBlueprintTypes";

export const itemIroncladCleaver: IEquippableMeleeTier16WeaponBlueprint = {
  key: AxesBlueprint.IroncladCleaver,
  type: ItemType.Weapon,
  subType: ItemSubType.Axe,
  textureAtlas: "items",
  texturePath: "axes/ironclad-cleaver-axe.png",
  name: "Ironclad Cleaver",
  description: "The Ironclad Cleaver axe commands respect with its sharp, imposing presence.",
  weight: 5.6,
  allowedEquipSlotType: [ItemSlotType.LeftHand, ItemSlotType.RightHand],
  attack: 117,
  defense: 115,
  tier: 16,
  rangeType: EntityAttackType.Melee,
  basePrice: 142,
  entityEffects: [EntityEffectBlueprint.Bleeding],
  entityEffectChance: 97,
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
  equippedBuffDescription: "Increases strength by 4%",
};
