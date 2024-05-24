import { EntityEffectBlueprint } from "@providers/entityEffects/data/types/entityEffectBlueprintTypes";
import { IEquippableMeleeTier15WeaponBlueprint } from "@providers/item/data/types/TierBlueprintTypes";
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

export const itemBlazingExecutioner: IEquippableMeleeTier15WeaponBlueprint = {
  key: AxesBlueprint.BlazingExecutioner,
  type: ItemType.Weapon,
  subType: ItemSubType.Axe,
  textureAtlas: "items",
  texturePath: "axes/blazing-executioner.png",
  name: "Blazing Executioner",
  description: "An axe wreathed in flames, bringing swift and fiery judgment upon its targets.",
  weight: 5,
  allowedEquipSlotType: [ItemSlotType.LeftHand, ItemSlotType.RightHand],
  attack: 106,
  defense: 109,
  tier: 15,
  rangeType: EntityAttackType.Melee,
  basePrice: 137,
  entityEffects: [EntityEffectBlueprint.Bleeding],
  entityEffectChance: 94,
  equippedBuff: {
    type: CharacterBuffType.Skill,
    trait: BasicAttribute.Resistance,
    buffPercentage: 5,
    durationType: CharacterBuffDurationType.Permanent,
    options: {
      messages: {
        activation: "You feel the power of resistance flowing through your body. (+5% resistance)",
        deactivation: "You feel the power of resistance leaving your body. (-5% resistance)",
      },
    },
  },
  equippedBuffDescription: "Increases resistance by 5%",
};
