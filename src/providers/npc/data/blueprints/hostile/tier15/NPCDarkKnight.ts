import { Dice } from "@providers/constants/DiceConstants";
import { MovementSpeed } from "@providers/constants/MovementConstants";
import { EntityEffectBlueprint } from "@providers/entityEffects/data/types/entityEffectBlueprintTypes";
import {
  AccessoriesBlueprint,
  ArmorsBlueprint,
  BootsBlueprint,
  CraftingResourcesBlueprint,
  FoodsBlueprint,
  HammersBlueprint,
  HelmetsBlueprint,
  LegsBlueprint,
  OthersBlueprint,
  RangedWeaponsBlueprint,
  ShieldsBlueprint,
  SpearsBlueprint,
  StaffsBlueprint,
  SwordsBlueprint,
} from "@providers/item/data/types/itemsBlueprintTypes";
import { INPCTierBlueprint } from "@providers/npc/data/types/npcTierTypes";
import { HostileNPCsBlueprint } from "@providers/npc/data/types/npcsBlueprintTypes";
import { MagicPower, NPCAlignment, NPCCustomDeathPenalties, RangeTypes, SpellsBlueprint } from "@rpg-engine/shared";
import { EntityAttackType } from "@rpg-engine/shared/dist/types/entity.types";
import { generateMoveTowardsMovement } from "../../../abstractions/BaseNeutralNPC";

export const npcDarkKnight: INPCTierBlueprint<15> = {
  ...generateMoveTowardsMovement(),
  name: "Dark Knight",
  key: HostileNPCsBlueprint.DarkKnight,
  // @ts-ignore
  textureKey: "superior-knight",
  alignment: NPCAlignment.Hostile,
  attackType: EntityAttackType.MeleeRanged,
  speed: MovementSpeed.ExtraFast,
  ammoKey: RangedWeaponsBlueprint.Bolt,
  maxRangeAttack: RangeTypes.High,
  baseHealth: 1320,
  hasCustomDeathPenalty: NPCCustomDeathPenalties.Hardcore,
  healthRandomizerDice: Dice.D20,
  canSwitchToRandomTarget: true,
  canSwitchToLowHealthTarget: true,
  skills: {
    level: 89,
    strength: {
      level: 98,
    },
    dexterity: {
      level: 98,
    },
    resistance: {
      level: 98,
    },
    magicResistance: {
      level: 98,
    },
  },
  loots: [
    {
      itemBlueprintKey: FoodsBlueprint.Cookie,
      chance: 75,
      quantityRange: [1, 10],
    },

    {
      itemBlueprintKey: CraftingResourcesBlueprint.Diamond,
      chance: 25,
      quantityRange: [1, 2],
    },
    {
      itemBlueprintKey: CraftingResourcesBlueprint.Silk,
      chance: 35,
      quantityRange: [1, 6],
    },
    {
      itemBlueprintKey: HelmetsBlueprint.BerserkersHelmet,
      chance: 10,
    },
    {
      itemBlueprintKey: OthersBlueprint.GoldCoin,
      chance: 50,
      quantityRange: [25, 75],
    },

    {
      itemBlueprintKey: CraftingResourcesBlueprint.Skull,
      chance: 50,
      quantityRange: [1, 10],
    },

    {
      itemBlueprintKey: ArmorsBlueprint.GoldenArmor,
      chance: 1,
    },

    {
      itemBlueprintKey: LegsBlueprint.GoldenLegs,
      chance: 2,
    },
    {
      itemBlueprintKey: BootsBlueprint.GoldenBoots,
      chance: 2,
    },
    {
      itemBlueprintKey: HelmetsBlueprint.RoyalHelmet,
      chance: 30,
    },

    {
      itemBlueprintKey: HelmetsBlueprint.SaviorsHelmet,
      chance: 5,
    },
    {
      itemBlueprintKey: SwordsBlueprint.CorruptionSword,
      chance: 5,
    },
    {
      itemBlueprintKey: AccessoriesBlueprint.HasteRing,
      chance: 10,
    },
    {
      itemBlueprintKey: HelmetsBlueprint.RoyalKnightHelmet,
      chance: 5,
    },
    {
      itemBlueprintKey: ShieldsBlueprint.SilverShield,
      chance: 30,
    },
    {
      itemBlueprintKey: CraftingResourcesBlueprint.PhoenixFeather,
      chance: 50,
      quantityRange: [1, 3],
    },
    {
      itemBlueprintKey: CraftingResourcesBlueprint.ObsidiumOre,
      chance: 30,
      quantityRange: [5, 7],
    },
    {
      itemBlueprintKey: ArmorsBlueprint.KnightArmor,
      chance: 20,
    },
    {
      itemBlueprintKey: HelmetsBlueprint.CrownHelmet,
      chance: 5,
    },
    {
      itemBlueprintKey: ArmorsBlueprint.CrownArmor,
      chance: 5,
    },
    {
      itemBlueprintKey: LegsBlueprint.BloodfireLegs,
      chance: 5,
    },
    {
      itemBlueprintKey: AccessoriesBlueprint.FalconsRing,
      chance: 5,
    },
    {
      itemBlueprintKey: ShieldsBlueprint.CrimsonAegisShield,
      chance: 1,
    },
    {
      itemBlueprintKey: ShieldsBlueprint.FalconsShield,
      chance: 5,
    },
    {
      itemBlueprintKey: SwordsBlueprint.FalconsSword,
      chance: 5,
    },
    {
      itemBlueprintKey: SpearsBlueprint.CopperDoubleVoulge,
      chance: 2,
    },

    {
      itemBlueprintKey: SpearsBlueprint.BohemianEarspoon,
      chance: 2,
    },
    {
      itemBlueprintKey: StaffsBlueprint.EagleEyeWand,
      chance: 1,
    },

    {
      itemBlueprintKey: HammersBlueprint.ThorHammer,
      chance: 1,
    },
    {
      itemBlueprintKey: RangedWeaponsBlueprint.TempestTalonTautBow,
      chance: 1,
    },
    {
      itemBlueprintKey: SwordsBlueprint.TitanTetherTachiSword,
      chance: 1,
    },
    {
      itemBlueprintKey: LegsBlueprint.TerraformLegs,
      chance: 3,
    },
  ],
  entityEffects: [EntityEffectBlueprint.Bleeding, EntityEffectBlueprint.Freezing],
  areaSpells: [
    {
      spellKey: SpellsBlueprint.Arrowstorm,
      probability: 10,
      power: MagicPower.Medium,
    },
    {
      spellKey: SpellsBlueprint.Blizzard,
      probability: 5,
      power: MagicPower.High,
    },
  ],
};
