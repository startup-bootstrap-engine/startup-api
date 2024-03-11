import { ISkill } from "@entities/ModuleCharacter/SkillsModel";
import { Dice } from "@providers/constants/DiceConstants";
import { MovementSpeed } from "@providers/constants/MovementConstants";
import { EntityEffectBlueprint } from "@providers/entityEffects/data/types/entityEffectBlueprintTypes";
import { RangedWeaponsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import {
  AnimationEffectKeys,
  EntityAttackType,
  MagicPower,
  NPCAlignment,
  NPCCustomDeathPenalties,
  NPCSubtype,
  RangeTypes,
  SpellsBlueprint,
} from "@rpg-engine/shared";
import { FriendlyNPCsBlueprint, HostileNPCsBlueprint, NeutralNPCsBlueprint } from "./npcsBlueprintTypes";

type NPCKeys = HostileNPCsBlueprint | FriendlyNPCsBlueprint | NeutralNPCsBlueprint;

interface INPCBlueprintSpellArea {
  spellKey: SpellsBlueprint;
  probability: number;
  power: MagicPower;
}

export interface IBaseNPCBlueprint {
  name: string;
  key: NPCKeys;
  subType: NPCSubtype;
  isMagic?: boolean;
  textureKey: NPCKeys;
  alignment: NPCAlignment;
  attackType: EntityAttackType;
  ammoKey?: RangedWeaponsBlueprint | AnimationEffectKeys;
  maxRangeAttack?: RangeTypes;
  isGiantForm?: boolean;
  speed: MovementSpeed;
  baseHealth: number;
  healthRandomizerDice: Dice;
  skillRandomizerDice?: Dice;
  skillsToBeRandomized?: Array<keyof ISkill>;
  hasCustomDeathPenalty?: NPCCustomDeathPenalties;
  skills: Partial<ISkill>;
  fleeOnLowHealth?: boolean;
  canSwitchToRandomTarget?: boolean;
  canSwitchToLowHealthTarget?: boolean;
  entityEffects?: EntityEffectBlueprint[];
  areaSpells?: INPCBlueprintSpellArea[];
  loots: {
    itemBlueprintKey: string;
    chance: number;
    quantityRange?: number[];
  }[];
}

const tierProperties = {
  0: {
    baseHealth: [20, 30, 40, 50] as const,
    skillLevel: [0.5, 1, 1.5, 2] as const,
  },
  1: {
    baseHealth: [60, 70, 80, 90] as const,
    skillLevel: [2.5, 3, 3.5, 4] as const,
  },
  2: {
    baseHealth: [100, 110, 120, 130] as const,
    skillLevel: [4.5, 5, 5.5, 6] as const,
  },
  3: {
    baseHealth: [140, 150, 160, 170] as const,
    skillLevel: [7, 8, 9, 10] as const,
  },
  4: {
    baseHealth: [180, 190, 200, 210] as const,
    skillLevel: [11, 12, 13, 14] as const,
  },
  5: {
    baseHealth: [220, 230, 240, 250] as const,
    skillLevel: [15, 16, 17, 18] as const,
  },
  6: {
    baseHealth: [280, 290, 300, 310] as const,
    skillLevel: [19, 20, 21, 22] as const,
  },
  7: {
    baseHealth: [320, 330, 340, 350] as const,
    skillLevel: [23, 24, 25, 26] as const,
  },
  8: {
    baseHealth: [360, 370, 380, 390] as const,
    skillLevel: [27, 28, 29, 30] as const,
  },
  9: {
    baseHealth: [400, 410, 420, 430] as const,
    skillLevel: [31, 32, 33, 34] as const,
  },
  10: {
    baseHealth: [440, 450, 460, 470] as const,
    skillLevel: [35, 36, 37, 38] as const,
  },
  11: {
    baseHealth: [520, 570, 620, 670] as const,
    skillLevel: [41, 44, 47, 50] as const,
  },
  12: {
    baseHealth: [720, 770, 820, 870] as const,
    skillLevel: [53, 56, 59, 62] as const,
  },
  13: {
    baseHealth: [920, 970, 1020, 1070] as const,
    skillLevel: [65, 68, 71, 74] as const,
  },
  14: {
    baseHealth: [1120, 1170, 1220, 1270] as const,
    skillLevel: [77, 80, 83, 86] as const,
  },
  15: {
    baseHealth: [1320, 1370, 1420, 1470] as const,
    skillLevel: [89, 92, 95, 98] as const,
  },
  16: {
    baseHealth: [1670, 1770, 1870, 1970] as const,
    skillLevel: [108, 118, 128, 138] as const,
  },
  17: {
    baseHealth: [2070, 2170, 2270, 2370] as const,
    skillLevel: [148, 158, 168, 178] as const,
  },
  18: {
    baseHealth: [2470, 2570, 2670, 2770] as const,
    skillLevel: [188, 198, 208, 218] as const,
  },
  19: {
    baseHealth: [2870, 2970, 3070, 3170] as const,
    skillLevel: [228, 238, 248, 258] as const,
  },
  20: {
    baseHealth: [3270, 3370, 3470, 3570] as const,
    skillLevel: [268, 278, 288, 298] as const,
  },
  21: {
    baseHealth: [3770, 3970, 4170, 4370] as const,
    skillLevel: [318, 338, 358, 378] as const,
  },
  22: {
    baseHealth: [4570, 4770, 4970, 5170] as const,
    skillLevel: [398, 418, 438, 458] as const,
  },
  23: {
    baseHealth: [5370, 5570, 5770, 5970] as const,
    skillLevel: [478, 498, 518, 538] as const,
  },
  24: {
    baseHealth: [6170, 6370, 6570, 6770] as const,
    skillLevel: [558, 578, 598, 618] as const,
  },
  25: {
    baseHealth: [6970, 7170, 7370, 7570] as const,
    skillLevel: [638, 658, 678, 698] as const,
  },
  26: {
    baseHealth: [7770, 7970, 8170, 8370] as const,
    skillLevel: [718, 738, 758, 778] as const,
  },
  27: {
    baseHealth: [8570, 8770, 8970, 9170] as const,
    skillLevel: [798, 818, 838, 858] as const,
  },
};

type Tier = keyof typeof tierProperties;

// Define the type for the properties of a tier
type TierProperties<T extends Tier> = {
  baseHealth: (typeof tierProperties)[T]["baseHealth"][number];
  skillLevel: (typeof tierProperties)[T]["skillLevel"][number];
};

// Define the interface for a NPC blueprint of a specific tier
export interface INPCTierBlueprint<T extends Tier> extends IBaseNPCBlueprint {
  tier: T;
  baseHealth: TierProperties<T>["baseHealth"];
  skills: {
    level: TierProperties<T>["skillLevel"];
    strength: {
      level: TierProperties<T>["skillLevel"];
    };
    dexterity: {
      level: TierProperties<T>["skillLevel"];
    };
    resistance: {
      level: TierProperties<T>["skillLevel"];
    };
    magicResistance?: {
      level: TierProperties<T>["skillLevel"];
    };
    distance?: {
      level: TierProperties<T>["skillLevel"];
    };
    magic?: {
      level: TierProperties<T>["skillLevel"];
    };
  };
}
