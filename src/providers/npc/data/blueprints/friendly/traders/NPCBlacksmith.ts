import { INPC } from "@entities/ModuleNPC/NPCModel";
import {
  ArmorsBlueprint,
  AxesBlueprint,
  BootsBlueprint,
  DaggersBlueprint,
  HelmetsBlueprint,
  LegsBlueprint,
  MacesBlueprint,
  SwordsBlueprint,
} from "@providers/item/data/types/itemsBlueprintTypes";
import { generateRandomMovement } from "@providers/npc/data/abstractions/BaseNeutralNPC";
import { CharacterGender } from "@rpg-engine/shared";

export const npcBlacksmith = {
  ...generateRandomMovement(),
  key: "blacksmith",
  name: "Thorne Forgehammer",
  textureKey: "fat-bald-man",
  gender: CharacterGender.Male,
  isTrader: true,
  traderItems: [
    {
      key: SwordsBlueprint.ShortSword,
    },
    {
      key: DaggersBlueprint.IronDagger,
    },
    {
      key: ArmorsBlueprint.StuddedArmor,
    },
    {
      key: HelmetsBlueprint.SoldiersHelmet,
    },
    {
      key: HelmetsBlueprint.BrassHelmet,
    },
    {
      key: ArmorsBlueprint.BrassArmor,
    },
    {
      key: LegsBlueprint.LeatherLegs,
    },
    {
      key: MacesBlueprint.SpikedClub,
    },
    {
      key: MacesBlueprint.Mace,
    },
    {
      key: AxesBlueprint.Axe,
    },
    {
      key: AxesBlueprint.Hatchet,
    },
    {
      key: BootsBlueprint.StuddedBoots,
    },
  ],
} as Partial<INPC>;
