import { Dice } from "@providers/constants/DiceConstants";
import { MovementSpeed } from "@providers/constants/MovementConstants";
import {
  ArmorsBlueprint,
  BootsBlueprint,
  CraftingResourcesBlueprint,
  FoodsBlueprint,
  GemsBlueprint,
  GlovesBlueprint,
  HammersBlueprint,
  SeedsBlueprint,
  ShieldsBlueprint,
  SpearsBlueprint,
  StaffsBlueprint,
} from "@providers/item/data/types/itemsBlueprintTypes";
import { LootProbability } from "@providers/npc/data/types/npcLootTypes";
import { INPCTierBlueprint } from "@providers/npc/data/types/npcTierTypes";
import { HostileNPCsBlueprint } from "@providers/npc/data/types/npcsBlueprintTypes";
import { NPCAlignment, NPCSubtype } from "@rpg-engine/shared";
import { EntityAttackType } from "@rpg-engine/shared/dist/types/entity.types";
import { generateMoveTowardsMovement } from "../../../abstractions/BaseNeutralNPC";

export const npcMudGolem: INPCTierBlueprint<10> = {
  ...generateMoveTowardsMovement(),
  name: "Mud Golem",
  key: HostileNPCsBlueprint.MudGolem,
  subType: NPCSubtype.Elemental,
  textureKey: HostileNPCsBlueprint.MudGolem,
  alignment: NPCAlignment.Hostile,
  attackType: EntityAttackType.Melee,
  speed: MovementSpeed.ExtraSlow,
  // @ts-ignore
  baseHealth: 1500,
  healthRandomizerDice: Dice.D6,
  canSwitchToRandomTarget: true,
  skillRandomizerDice: Dice.D4,
  skillsToBeRandomized: ["level", "strength", "dexterity", "resistance"],
  skills: {
    level: 38,
    strength: {
      level: 38,
    },
    dexterity: {
      level: 35,
    },
    resistance: {
      // @ts-ignore
      level: 100,
    },
    magicResistance: {
      // @ts-ignore
      level: 100,
    },
  },
  fleeOnLowHealth: true,
  loots: [
    {
      itemBlueprintKey: BootsBlueprint.CopperBoots,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: SeedsBlueprint.CabbageSeed,
      chance: LootProbability.Common,
      quantityRange: [1, 3],
    },
    {
      itemBlueprintKey: SpearsBlueprint.RoyalSpear,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: GlovesBlueprint.PlateGloves,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: ShieldsBlueprint.StoneShield,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: ArmorsBlueprint.FalconsArmor,
      chance: LootProbability.VeryRare,
    },
    {
      itemBlueprintKey: FoodsBlueprint.Fish,
      chance: LootProbability.SemiCommon,
    },

    {
      itemBlueprintKey: StaffsBlueprint.FireWand,
      chance: LootProbability.Uncommon,
    },
    {
      itemBlueprintKey: CraftingResourcesBlueprint.PolishedStone,
      chance: LootProbability.Uncommon,
      quantityRange: [1, 5],
    },
    {
      itemBlueprintKey: HammersBlueprint.DragonFistHammer,
      chance: LootProbability.VeryRare,
    },
    {
      itemBlueprintKey: GlovesBlueprint.OsirisGloves,
      chance: LootProbability.VeryRare,
    },
    {
      itemBlueprintKey: GemsBlueprint.CoralReefGem,
      chance: LootProbability.Common,
    },
  ],
};
