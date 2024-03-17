import { IItem } from "@entities/ModuleInventory/ItemModel";
import {
  ITEM_MIN_REQUIREMENT_LEVEL_MULTIPLIER,
  ITEM_MIN_REQUIREMENT_SKILL_MULTIPLIER,
} from "@providers/constants/ItemMinRequirementsConstants";
import { blueprintManager } from "@providers/inversify/container";
import { seedToPlantMapping } from "@providers/plant/data/PlantSeedMap";
import { plantsBlueprints } from "@providers/plant/data/blueprints";
import { IPlantItem } from "@providers/plant/data/blueprints/PlantItem";
import {
  BasicAttribute,
  CombatSkill,
  CraftingSkill,
  IEquippableItemBlueprint,
  IEquippableWeaponBlueprint,
  MinRequirements as IItemMinRequirements,
  ItemSubType,
  ItemType,
} from "@rpg-engine/shared";
import { itemsBlueprintIndex } from "./data";
import { SeedsBlueprint } from "./data/types/itemsBlueprintTypes";

export function getMinRequirements(blueprintKey: string, skillName: string): IItemMinRequirements {
  const levelMultiplier = 1.5;
  const skillMultiplier = 0.45;
  const attackMultiplier = 0.5;
  const defenseMultiplier = 0.65;
  const weightMultiplier = 1;
  const entityEffectMultiplier = 0.1;

  const itemBlueprint = itemsBlueprintIndex[blueprintKey];

  if (!itemBlueprint) {
    throw new Error(
      `Failed to calculate min item requirements: Item blueprint with key ${blueprintKey} does not exist.`
    );
  }

  const { attack, defense, weight, entityEffectChance, subType } = itemBlueprint as IEquippableWeaponBlueprint;
  let finalMultiplier = 1;
  if (subType === ItemSubType.Axe) {
    finalMultiplier = 0.9;
  } else if (subType === ItemSubType.Spear) {
    finalMultiplier = 0.6;
  } else if (subType === ItemSubType.Dagger || subType === ItemSubType.Sword || subType === ItemSubType.Ranged) {
    finalMultiplier = 1.2;
  } else if (subType === ItemSubType.Mace) {
    finalMultiplier = 1.4;
  } else if (subType === ItemSubType.Shield) {
    finalMultiplier = 0.9;
  } else if (
    subType === ItemSubType.Helmet ||
    subType === ItemSubType.Boot ||
    subType === ItemSubType.Glove ||
    subType === ItemSubType.Legs
  ) {
    finalMultiplier = 1.4;
  }

  const attackReq = attack ? attack * attackMultiplier : 0;
  const defenseReq = defense ? defense * defenseMultiplier : 0;
  const weightReq = weight ? weight * weightMultiplier : 0;
  const entityEffectReq = entityEffectChance ? entityEffectChance * entityEffectMultiplier : 0;

  const highestReq = Math.max(attackReq, defenseReq, weightReq, entityEffectReq);

  const levelReq = Math.ceil(highestReq * levelMultiplier * finalMultiplier);
  const skillReq = Math.ceil(highestReq * skillMultiplier * finalMultiplier);

  const minRequirements: IItemMinRequirements = {
    level: levelReq,
    skill: {
      name: skillName,
      level: skillReq,
    },
  };

  return minRequirements;
}

export function getMinSeedRequirements(blueprintKey: string, skillName: string): IItemMinRequirements {
  if (blueprintKey === SeedsBlueprint.CarrotSeed) {
    // initial shouldnt require skills
    return {
      level: 0,
      skill: {
        name: skillName,
        level: 0,
      },
    };
  }

  const levelMultiplier = 0.1;
  const skillMultiplier = 0.12;
  const regrowsAfterHarvestMultiplier = 4.5;
  const growthFactorMultiplier = 1.25;
  const yieldFactorMultiplier = 1.25;
  const finalMultiplier = 0.7;

  const plantKey = seedToPlantMapping[blueprintKey];

  const plantBlueprint = plantsBlueprints[plantKey];

  const { regrowsAfterHarvest, growthFactor, yieldFactor } = plantBlueprint as IPlantItem;

  const regrowsAfterHarvestReq = regrowsAfterHarvest ? regrowsAfterHarvestMultiplier : 0;

  const growthFactorReq = Math.pow(growthFactor, 3) * growthFactorMultiplier;
  const yieldFactorReq = Math.pow(yieldFactor, 3) * yieldFactorMultiplier;

  const highestReq = Math.max(regrowsAfterHarvestReq, growthFactorReq, yieldFactorReq);

  const levelReq = Math.ceil(highestReq * levelMultiplier * finalMultiplier);
  const skillReq = Math.ceil(highestReq * skillMultiplier * finalMultiplier);

  const minRequirements: IItemMinRequirements = {
    level: levelReq,
    skill: {
      name: skillName,
      level: skillReq,
    },
  };

  return minRequirements;
}

export const getMinRequiredSkill = async (item: IItem): Promise<BasicAttribute | CombatSkill | CraftingSkill> => {
  const itemBluePrint = await blueprintManager.getBlueprint<IEquippableItemBlueprint>("items", item.key);
  if (item.type === ItemType.Armor) {
    // return magic level for mages
    if (itemBluePrint.isMageGear) {
      return BasicAttribute.Magic;
    }
    if (item.subType === ItemSubType.Shield) {
      return CombatSkill.Shielding;
    }

    return BasicAttribute.Strength;
  }

  if (item.type === ItemType.Accessory) {
    return BasicAttribute.Dexterity;
  }

  if (item.type === ItemType.Weapon) {
    if (item.subType === ItemSubType.Sword) {
      return CombatSkill.Sword;
    }
    if (item.subType === ItemSubType.Dagger) {
      return CombatSkill.Dagger;
    }
    if (item.subType === ItemSubType.Axe) {
      return CombatSkill.Axe;
    }
    if (item.subType === ItemSubType.Mace) {
      return CombatSkill.Club;
    }
    if (item.subType === ItemSubType.Spear) {
      return CombatSkill.Distance;
    }
    if (item.subType === ItemSubType.Staff) {
      return BasicAttribute.Magic;
    }
    if (item.subType === ItemSubType.Ranged) {
      return CombatSkill.Distance;
    }

    if (item.subType === ItemSubType.Glove) {
      return CombatSkill.First;
    }
  }

  return BasicAttribute.Strength;
};

export const minItemLevelSkillRequirementsMiddleware = async (data: IItem): Promise<IItem> => {
  const item = data as IItem;

  // if the item already has min requirements, just return what we set.
  // @ts-ignore
  if (item.minRequirements) {
    return item;
  }

  // else, automatically add minRequirements to all items tier 2+
  if (item.tier! >= 2) {
    const minRequiredSkill = await getMinRequiredSkill(item);
    const minRequirements = getMinRequirements(item.key, minRequiredSkill);

    minRequirements.level = Math.ceil(minRequirements.level * ITEM_MIN_REQUIREMENT_LEVEL_MULTIPLIER);
    minRequirements.skill.level = Math.ceil(minRequirements.skill.level * ITEM_MIN_REQUIREMENT_SKILL_MULTIPLIER);

    // @ts-ignore
    item.minRequirements = minRequirements;

    return item;
  }

  if (item.subType === ItemSubType.Seed) {
    const minRequiredSkill = CraftingSkill.Farming;
    const minRequirements = getMinSeedRequirements(item.key, minRequiredSkill);

    // @ts-ignore
    item.minRequirements = minRequirements;

    return item;
  }

  return item;
};
