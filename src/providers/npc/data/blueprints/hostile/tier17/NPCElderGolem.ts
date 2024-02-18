import { Dice } from "@providers/constants/DiceConstants";
import {
  ArmorsBlueprint,
  BootsBlueprint,
  CraftingResourcesBlueprint,
  DaggersBlueprint,
  GlovesBlueprint,
  HelmetsBlueprint,
  ShieldsBlueprint,
  StaffsBlueprint,
  SwordsBlueprint,
} from "@providers/item/data/types/itemsBlueprintTypes";
import { INPCTierBlueprint } from "@providers/npc/data/types/npcTierTypes";
import { HostileNPCsBlueprint } from "@providers/npc/data/types/npcsBlueprintTypes";
import { SpellsBlueprint } from "@providers/spells/data/types/SpellsBlueprintTypes";
import { MagicPower, NPCAlignment, NPCSubtype, RangeTypes } from "@rpg-engine/shared";
import { EntityAttackType } from "@rpg-engine/shared/dist/types/entity.types";
import { generateMoveTowardsMovement } from "../../../abstractions/BaseNeutralNPC";

export const npcElderGolem: INPCTierBlueprint<17> = {
  ...generateMoveTowardsMovement(),
  name: "Elder Golem",
  key: HostileNPCsBlueprint.ElderGolem,
  subType: NPCSubtype.Elemental,
  textureKey: HostileNPCsBlueprint.ElderGolem,
  alignment: NPCAlignment.Hostile,
  attackType: EntityAttackType.Melee,
  maxRangeAttack: RangeTypes.High,
  tier: 17,
  baseHealth: 2370,
  healthRandomizerDice: Dice.D6,
  skillRandomizerDice: Dice.D4,
  skillsToBeRandomized: ["level", "strength", "dexterity"],
  canSwitchToLowHealthTarget: true,
  skills: {
    level: 158,
    strength: {
      level: 158,
    },
    dexterity: {
      level: 158,
    },
    resistance: {
      level: 158,
    },
  },
  loots: [
    {
      itemBlueprintKey: HelmetsBlueprint.SaviorsHelmet,
      chance: 20,
    },
    {
      itemBlueprintKey: ArmorsBlueprint.PlateArmor,
      chance: 5,
    },
    {
      itemBlueprintKey: GlovesBlueprint.ChainGloves,
      chance: 20,
    },
    {
      itemBlueprintKey: BootsBlueprint.RoyalBoots,
      chance: 5,
    },
    {
      itemBlueprintKey: ShieldsBlueprint.PlateShield,
      chance: 5,
    },
    {
      itemBlueprintKey: CraftingResourcesBlueprint.GreaterWoodenLog,
      chance: 30,
      quantityRange: [1, 2],
    },
    {
      itemBlueprintKey: StaffsBlueprint.RubyStaff,
      chance: 10,
    },
    {
      itemBlueprintKey: CraftingResourcesBlueprint.PolishedStone,
      chance: 30,
      quantityRange: [5, 20],
    },
    {
      itemBlueprintKey: DaggersBlueprint.FlameheartDagger,
      chance: 18,
    },
    {
      itemBlueprintKey: DaggersBlueprint.StormswiftDagger,
      chance: 20,
    },
    {
      itemBlueprintKey: DaggersBlueprint.MistfireDagger,
      chance: 22,
    },
    {
      itemBlueprintKey: SwordsBlueprint.MoonlightCrescent,
      chance: 10,
    },
    {
      itemBlueprintKey: SwordsBlueprint.Stormbreaker,
      chance: 10,
    },
    {
      itemBlueprintKey: SwordsBlueprint.ThunderclapKatana,
      chance: 10,
    },
  ],
  areaSpells: [
    {
      spellKey: SpellsBlueprint.CleavingStomp,
      probability: 50,
      power: MagicPower.High,
    },
  ],
};
