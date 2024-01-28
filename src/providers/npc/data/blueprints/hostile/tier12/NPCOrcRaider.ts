import { Dice } from "@providers/constants/DiceConstants";
import { MovementSpeed } from "@providers/constants/MovementConstants";
import { EntityEffectBlueprint } from "@providers/entityEffects/data/types/entityEffectBlueprintTypes";
import {
  AccessoriesBlueprint,
  ArmorsBlueprint,
  BootsBlueprint,
  ContainersBlueprint,
  CraftingResourcesBlueprint,
  DaggersBlueprint,
  GlovesBlueprint,
  HammersBlueprint,
  HelmetsBlueprint,
  MacesBlueprint,
  RangedWeaponsBlueprint,
  StaffsBlueprint,
  SwordsBlueprint,
} from "@providers/item/data/types/itemsBlueprintTypes";
import { INPCTierBlueprint } from "@providers/npc/data/types/npcTierTypes";
import { HostileNPCsBlueprint } from "@providers/npc/data/types/npcsBlueprintTypes";
import { MagicPower, NPCAlignment, NPCSubtype, RangeTypes, SpellsBlueprint } from "@rpg-engine/shared";
import { EntityAttackType } from "@rpg-engine/shared/dist/types/entity.types";
import { generateMoveTowardsMovement } from "../../../abstractions/BaseNeutralNPC";

export const npcOrcRaider: INPCTierBlueprint<12> = {
  ...generateMoveTowardsMovement(),
  name: "Orc Raider",
  subType: NPCSubtype.Humanoid,
  key: HostileNPCsBlueprint.OrcRaider,
  textureKey: HostileNPCsBlueprint.OrcRaider,
  alignment: NPCAlignment.Hostile,
  attackType: EntityAttackType.MeleeRanged,
  ammoKey: RangedWeaponsBlueprint.Arrow,
  speed: MovementSpeed.ExtraFast,
  maxRangeAttack: RangeTypes.High,
  tier: 12,
  baseHealth: 820,
  healthRandomizerDice: Dice.D6,
  skillRandomizerDice: Dice.D4,
  skillsToBeRandomized: ["level", "strength", "dexterity"],
  canSwitchToRandomTarget: true,
  canSwitchToLowHealthTarget: true,
  skills: {
    level: 59,
    strength: {
      level: 53,
    },
    dexterity: {
      level: 62,
    },
    resistance: {
      level: 62,
    },
    magicResistance: {
      level: 62,
    },
  },
  loots: [
    {
      itemBlueprintKey: CraftingResourcesBlueprint.GreenOre,
      chance: 10,
      quantityRange: [1, 3],
    },
    {
      itemBlueprintKey: AccessoriesBlueprint.OrcRing,
      chance: 20,
    },
    {
      itemBlueprintKey: CraftingResourcesBlueprint.RedSapphire,
      chance: 20,
      quantityRange: [1, 3],
    },
    {
      itemBlueprintKey: HammersBlueprint.WarHammer,
      chance: 10,
    },
    {
      itemBlueprintKey: HelmetsBlueprint.InfantryHelmet,
      chance: 10,
    },
    {
      itemBlueprintKey: StaffsBlueprint.AirWand,
      chance: 10,
    },

    {
      itemBlueprintKey: DaggersBlueprint.RomanDagger,
      chance: 7,
    },
    {
      itemBlueprintKey: SwordsBlueprint.JianSword,
      chance: 5,
    },
    {
      itemBlueprintKey: ContainersBlueprint.Backpack,
      chance: 10,
    },
    {
      itemBlueprintKey: MacesBlueprint.WhirlWindCrusherClub,
      chance: 5,
    },
    {
      itemBlueprintKey: MacesBlueprint.SkullCrusherClub,
      chance: 10,
    },
    {
      itemBlueprintKey: BootsBlueprint.CopperBoots,
      chance: 20,
    },
    {
      itemBlueprintKey: GlovesBlueprint.PlateGloves,
      chance: 10,
    },
    {
      itemBlueprintKey: ArmorsBlueprint.PlateArmor,
      chance: 5,
    },
  ],
  entityEffects: [EntityEffectBlueprint.VineGrasp],
  areaSpells: [
    {
      spellKey: SpellsBlueprint.VineGrasp,
      probability: 50,
      power: MagicPower.High,
    },
  ],
};
