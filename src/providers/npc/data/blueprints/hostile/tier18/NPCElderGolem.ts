import { Dice } from "@providers/constants/DiceConstants";
import {
  AccessoriesBlueprint,
  ArmorsBlueprint,
  BooksBlueprint,
  BootsBlueprint,
  CraftingResourcesBlueprint,
  DaggersBlueprint,
  GlovesBlueprint,
  HelmetsBlueprint,
  RangedWeaponsBlueprint,
  ShieldsBlueprint,
  StaffsBlueprint,
  SwordsBlueprint,
} from "@providers/item/data/types/itemsBlueprintTypes";
import { LootProbability } from "@providers/npc/data/types/npcLootTypes";
import { INPCTierBlueprint } from "@providers/npc/data/types/npcTierTypes";
import { HostileNPCsBlueprint } from "@providers/npc/data/types/npcsBlueprintTypes";
import { MagicPower, NPCAlignment, NPCSubtype, RangeTypes, SpellsBlueprint } from "@rpg-engine/shared";
import { EntityAttackType } from "@rpg-engine/shared/dist/types/entity.types";
import { generateMoveTowardsMovement } from "../../../abstractions/BaseNeutralNPC";

export const npcElderGolem: INPCTierBlueprint<18> = {
  ...generateMoveTowardsMovement(),
  name: "Elder Golem",
  key: HostileNPCsBlueprint.ElderGolem,
  subType: NPCSubtype.Elemental,
  textureKey: HostileNPCsBlueprint.StoneGolem,
  alignment: NPCAlignment.Hostile,
  attackType: EntityAttackType.Ranged,
  ammoKey: RangedWeaponsBlueprint.Stone,
  maxRangeAttack: RangeTypes.High,
  isGiantForm: true,
  tier: 18,
  // @ts-ignore
  baseHealth: 30000,
  canSwitchToRandomTarget: true,
  healthRandomizerDice: Dice.D6,
  skillRandomizerDice: Dice.D4,
  skillsToBeRandomized: ["level", "strength", "dexterity"],
  canSwitchToLowHealthTarget: true,
  skills: {
    level: 218,
    strength: {
      level: 218,
    },
    dexterity: {
      level: 218,
    },
    resistance: {
      level: 218,
    },
    magicResistance: {
      level: 218,
    },
  },
  loots: [
    {
      itemBlueprintKey: HelmetsBlueprint.SaviorsHelmet,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: ArmorsBlueprint.PlateArmor,
      chance: LootProbability.Rare,
    },
    {
      itemBlueprintKey: GlovesBlueprint.ChainGloves,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: BootsBlueprint.RoyalBoots,
      chance: LootProbability.Rare,
    },
    {
      itemBlueprintKey: ShieldsBlueprint.PlateShield,
      chance: LootProbability.Rare,
    },
    {
      itemBlueprintKey: CraftingResourcesBlueprint.GreaterWoodenLog,
      chance: LootProbability.SemiCommon,
      quantityRange: [1, 2],
    },
    {
      itemBlueprintKey: StaffsBlueprint.RubyStaff,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: CraftingResourcesBlueprint.PolishedStone,
      chance: LootProbability.SemiCommon,
      quantityRange: [5, 20],
    },
    {
      itemBlueprintKey: DaggersBlueprint.FlameheartDagger,
      chance: LootProbability.Rare,
    },
    {
      itemBlueprintKey: DaggersBlueprint.StormswiftDagger,
      chance: LootProbability.Rare,
    },
    {
      itemBlueprintKey: DaggersBlueprint.MistfireDagger,
      chance: LootProbability.Rare,
    },

    {
      itemBlueprintKey: SwordsBlueprint.Stormbreaker,
      chance: LootProbability.Rare,
    },

    {
      itemBlueprintKey: AccessoriesBlueprint.GarnetNecklace,
      chance: LootProbability.VeryRare,
    },
    {
      itemBlueprintKey: AccessoriesBlueprint.GoldenGlowRing,
      chance: LootProbability.Rare,
    },
    {
      itemBlueprintKey: BooksBlueprint.MysticCompendium,
      chance: LootProbability.Rare,
    },
    {
      itemBlueprintKey: BooksBlueprint.MysticalMemoirs,
      chance: LootProbability.Rare,
    },
    {
      itemBlueprintKey: BooksBlueprint.AstralAtlas,
      chance: LootProbability.Rare,
    },
    {
      itemBlueprintKey: HelmetsBlueprint.AmethystArchmageHat,
      chance: LootProbability.Rare,
    },
  ],
  areaSpells: [
    {
      spellKey: SpellsBlueprint.CleavingStomp,
      probability: 50,
      power: MagicPower.High,
    },
    {
      spellKey: SpellsBlueprint.NaturesRevenge,
      probability: 5,
      power: MagicPower.Low,
    },
  ],
};
