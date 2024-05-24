import { EntityEffectBlueprint } from "@providers/entityEffects/data/types/entityEffectBlueprintTypes";
import { IEquippableMeleeTier12WeaponBlueprint } from "@providers/item/data/types/TierBlueprintTypes";
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

export const itemStarlightHammer: IEquippableMeleeTier12WeaponBlueprint = {
  key: HammersBlueprint.StarlightHammer,
  type: ItemType.Weapon,
  subType: ItemSubType.Mace,
  textureAtlas: "items",
  texturePath: "hammers/starlight-hammer.png",
  name: "Starlight Hammer",
  description:
    "A celestial hammer that shines with the brilliance of a thousand stars, its strikes imbued with cosmic energy.",
  weight: 1.3,
  allowedEquipSlotType: [ItemSlotType.LeftHand, ItemSlotType.RightHand],
  attack: 89,
  defense: 40,
  tier: 12,
  rangeType: EntityAttackType.Melee,
  entityEffects: [EntityEffectBlueprint.Bleeding],
  entityEffectChance: 85,
  equippedBuff: {
    type: CharacterBuffType.Skill,
    trait: BasicAttribute.Resistance,
    buffPercentage: 10,
    durationType: CharacterBuffDurationType.Permanent,
    options: {
      messages: {
        activation: "You feel the power of resistance flowing through your body. (+10% resistance)",
        deactivation: "You feel the power of resistance leaving your body. (-10% resistance)",
      },
    },
  },
  equippedBuffDescription: "Increases resistance by 10%",
};
