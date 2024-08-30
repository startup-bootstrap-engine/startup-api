import { INPC } from "@entities/ModuleNPC/NPCModel";
import { FoodsBlueprint, ToolsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { generateRandomMovement } from "@providers/npc/data/abstractions/BaseNeutralNPC";
import { CharacterGender } from "@rpg-engine/shared";

export const npcTraderFood = {
  ...generateRandomMovement(),
  key: "trader-food",
  name: "Marisol the Baker",
  textureKey: "dynasty-woman-1",
  gender: CharacterGender.Female,
  isTrader: true,
  traderItems: [
    {
      key: FoodsBlueprint.Cookie,
    },
    {
      key: ToolsBlueprint.ButchersKnife,
    },
    {
      key: FoodsBlueprint.Tuna,
    },
    {
      key: FoodsBlueprint.Strawberry,
    },
    {
      key: FoodsBlueprint.Bread,
    },
    {
      key: FoodsBlueprint.BananaBunch,
    },
  ],
} as Partial<INPC>;
