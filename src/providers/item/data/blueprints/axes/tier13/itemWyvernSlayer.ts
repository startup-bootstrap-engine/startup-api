import { EntityEffectBlueprint } from "@providers/entityEffects/data/types/entityEffectBlueprintTypes";
import { IEquippableMeleeTier13WeaponBlueprint } from "@providers/item/data/types/TierBlueprintTypes";
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

export const itemWyvernSlayer: IEquippableMeleeTier13WeaponBlueprint = {
  key: AxesBlueprint.WyvernSlayer,
  type: ItemType.Weapon,
  subType: ItemSubType.Axe,
  textureAtlas: "items",
  texturePath: "axes/wyvern-slayer.png",
  name: "Wyvern Slayer",
  description: "A fearsome axe forged to bring down the mighty wyverns of the skies.",
  weight: 4.5,
  allowedEquipSlotType: [ItemSlotType.LeftHand, ItemSlotType.RightHand],
  attack: 96,
  defense: 96,
  tier: 13,
  rangeType: EntityAttackType.Melee,
  basePrice: 129,
  entityEffects: [EntityEffectBlueprint.Bleeding],
  entityEffectChance: 70,
  equippedBuff: [
    {
      type: CharacterBuffType.Skill,
      trait: BasicAttribute.Strength,
      buffPercentage: 10,
      durationType: CharacterBuffDurationType.Permanent,
      options: {
        messages: {
          activation: "You feel the power of strength flowing through your body. (+10% strength)",
          deactivation: "You feel the power of strength leaving your body. (-10% strength)",
        },
      },
    },
    {
      type: CharacterBuffType.Skill,
      trait: BasicAttribute.Dexterity,
      buffPercentage: 5,
      durationType: CharacterBuffDurationType.Permanent,
      options: {
        messages: {
          activation: "You feel the power of dexterity flowing through your body. (+5% dexterity)",
          deactivation: "You feel the power of dexterity leaving your body. (-5% dexterity)",
        },
      },
    },
  ],
  equippedBuffDescription: "Increases strength by 10% and dexterity by 5% respectively",
};
