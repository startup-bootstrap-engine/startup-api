import { Dice } from "@providers/constants/DiceConstants";
import { MovementSpeed } from "@providers/constants/MovementConstants";
import { EntityEffectBlueprint } from "@providers/entityEffects/data/types/entityEffectBlueprintTypes";
import {
  ArmorsBlueprint,
  AxesBlueprint,
  BootsBlueprint,
  CraftingResourcesBlueprint,
  FoodsBlueprint,
  GemsBlueprint,
  HammersBlueprint,
  HelmetsBlueprint,
  RangedWeaponsBlueprint,
  SeedsBlueprint,
  ShieldsBlueprint,
  StaffsBlueprint,
  SwordsBlueprint,
} from "@providers/item/data/types/itemsBlueprintTypes";
import { LootProbability } from "@providers/npc/data/types/npcLootTypes";
import { INPCTierBlueprint } from "@providers/npc/data/types/npcTierTypes";
import { HostileNPCsBlueprint } from "@providers/npc/data/types/npcsBlueprintTypes";
import { MagicPower, NPCAlignment, NPCSubtype, SpellsBlueprint } from "@rpg-engine/shared";
import { EntityAttackType } from "@rpg-engine/shared/dist/types/entity.types";
import { generateMoveTowardsMovement } from "../../../abstractions/BaseNeutralNPC";

export const npcIceTroll: INPCTierBlueprint<10> = {
  ...generateMoveTowardsMovement(),
  name: "Ice Troll",
  key: HostileNPCsBlueprint.IceTroll,
  subType: NPCSubtype.Humanoid,
  textureKey: HostileNPCsBlueprint.IceTroll,
  alignment: NPCAlignment.Hostile,
  attackType: EntityAttackType.Melee,
  speed: MovementSpeed.Standard,
  baseHealth: 460,
  tier: 10,
  healthRandomizerDice: Dice.D20,
  skillRandomizerDice: Dice.D4,
  skillsToBeRandomized: ["level", "strength", "dexterity", "resistance"],
  canSwitchToRandomTarget: true,
  skills: {
    level: 38,
    strength: {
      level: 38,
    },
    dexterity: {
      level: 35,
    },
    resistance: {
      level: 35,
    },
    magicResistance: {
      level: 35,
    },
  },
  fleeOnLowHealth: true,
  loots: [
    {
      itemBlueprintKey: SwordsBlueprint.IceSword,
      chance: LootProbability.Rare,
    },
    {
      itemBlueprintKey: SwordsBlueprint.GlacialSword,
      chance: LootProbability.Rare,
    },
    {
      itemBlueprintKey: AxesBlueprint.FrostDoubleAxe,
      chance: LootProbability.Rare,
    },
    {
      itemBlueprintKey: AxesBlueprint.DwarvenWaraxe,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: SeedsBlueprint.CabbageSeed,
      chance: LootProbability.Common,
      quantityRange: [1, 3],
    },
    {
      itemBlueprintKey: ShieldsBlueprint.FrostShield,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: RangedWeaponsBlueprint.FrostCrossbow,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: FoodsBlueprint.Fish,
      chance: LootProbability.SemiCommon,
    },
    {
      itemBlueprintKey: BootsBlueprint.PlateBoots,
      chance: LootProbability.Uncommon,
    },

    {
      itemBlueprintKey: FoodsBlueprint.Salmon,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: SwordsBlueprint.Saber,
      chance: LootProbability.Uncommon,
    },

    {
      itemBlueprintKey: ArmorsBlueprint.BronzeArmor,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: HammersBlueprint.WarHammer,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: HelmetsBlueprint.InfantryHelmet,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: CraftingResourcesBlueprint.BlueLeather,
      chance: LootProbability.Uncommon,
      quantityRange: [1, 5],
    },
    {
      itemBlueprintKey: CraftingResourcesBlueprint.Rock,
      chance: LootProbability.Uncommon,
      quantityRange: [1, 5],
    },

    {
      itemBlueprintKey: CraftingResourcesBlueprint.Skull,
      chance: LootProbability.Uncommon,
      quantityRange: [1, 3],
    },
    {
      itemBlueprintKey: StaffsBlueprint.FrostbiteWand,
      chance: LootProbability.Rare,
    },
    {
      itemBlueprintKey: GemsBlueprint.JasperGem,
      chance: LootProbability.VeryRare,
    },
    {
      itemBlueprintKey: AxesBlueprint.HellishWarAxe,
      chance: LootProbability.Rare,
    },
  ],
  entityEffects: [EntityEffectBlueprint.Bleeding, EntityEffectBlueprint.Freezing],
  areaSpells: [
    {
      spellKey: SpellsBlueprint.Blizzard,
      probability: 10,
      power: MagicPower.High,
    },
  ],
};
