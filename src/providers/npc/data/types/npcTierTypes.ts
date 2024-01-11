import { ISkill } from "@entities/ModuleCharacter/SkillsModel";
import { Dice } from "@providers/constants/DiceConstants";
import { MovementSpeed } from "@providers/constants/MovementConstants";
import { EntityEffectBlueprint } from "@providers/entityEffects/data/types/entityEffectBlueprintTypes";
import { RangedWeaponsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { EntityAttackType, NPCAlignment, NPCSubtype, RangeTypes } from "@rpg-engine/shared";
import { FriendlyNPCsBlueprint, HostileNPCsBlueprint, NeutralNPCsBlueprint } from "./npcsBlueprintTypes";

type NPCKeys = HostileNPCsBlueprint | FriendlyNPCsBlueprint | NeutralNPCsBlueprint;

export interface IBaseNPCBlueprint {
  name: string;
  key: NPCKeys;
  subType: NPCSubtype;
  isMagic?: boolean;
  textureKey: NPCKeys;
  alignment: NPCAlignment;
  attackType: EntityAttackType;
  ammoKey?: RangedWeaponsBlueprint;
  maxRangeAttack?: RangeTypes;
  speed: MovementSpeed;
  baseHealth: number;
  healthRandomizerDice: Dice;
  skillRandomizerDice?: Dice;
  skillsToBeRandomized?: Array<keyof ISkill>;
  skills: Partial<ISkill>;
  fleeOnLowHealth?: boolean;
  canSwitchToRandomTarget?: boolean;
  canSwitchToLowHealthTarget?: boolean;
  entityEffects?: EntityEffectBlueprint[];
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
    magicResistance: {
      level: TierProperties<T>["skillLevel"];
    };
  };
}
