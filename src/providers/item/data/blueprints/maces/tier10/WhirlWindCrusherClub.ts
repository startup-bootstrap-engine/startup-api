import { EntityEffectBlueprint } from "@providers/entityEffects/data/types/entityEffectBlueprintTypes";
import { IEquippableMeleeTier10WeaponBlueprint } from "@providers/item/data/types/TierBlueprintTypes";
import {
  BasicAttribute,
  CharacterBuffDurationType,
  CharacterBuffType,
  EntityAttackType,
  ItemSlotType,
  ItemSubType,
  ItemType,
} from "@rpg-engine/shared";
import { MacesBlueprint } from "../../../types/itemsBlueprintTypes";

export const itemWhirlWindCrusherClub: IEquippableMeleeTier10WeaponBlueprint = {
  key: MacesBlueprint.WhirlWindCrusherClub,
  type: ItemType.Weapon,
  subType: ItemSubType.Mace,
  textureAtlas: "items",
  texturePath: "maces/whirl-wind-crusher-club.png",
  name: "Whirl Wind Crusher Club",
  description: "Twin Fang Club perfectly encapsulates both the fierceness and descriptive essence of the weapon.",
  weight: 5,
  allowedEquipSlotType: [ItemSlotType.LeftHand, ItemSlotType.RightHand],
  attack: 73,
  defense: 69,
  tier: 10,
  rangeType: EntityAttackType.Melee,
  entityEffects: [EntityEffectBlueprint.Bleeding],
  entityEffectChance: 100,
  equippedBuff: {
    type: CharacterBuffType.Skill,
    trait: BasicAttribute.Strength,
    buffPercentage: 15,
    durationType: CharacterBuffDurationType.Permanent,
    options: {
      messages: {
        activation: "You feel the strength and fortitude coursing through your body. (+15% strength)",
        deactivation: "You feel the strength and fortitude coursing leaving through your body. (-15% strength)",
      },
    },
  },
  equippedBuffDescription: "Increases strength by 15%",
};
