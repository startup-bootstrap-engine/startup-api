import { Dice } from "@providers/constants/DiceConstants";
import { MovementSpeed } from "@providers/constants/MovementConstants";
import { CraftingResourcesBlueprint, FoodsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { NeutralNPCsBlueprint } from "@providers/npc/data/types/npcsBlueprintTypes";
import { NPCAlignment, NPCSubtype } from "@rpg-engine/shared";
import { EntityAttackType } from "@rpg-engine/shared/dist/types/entity.types";
import { generateMoveAwayMovement } from "../../abstractions/BaseNeutralNPC";
import { IBaseNPCBlueprint } from "../../types/npcTierTypes";

export const npcRedDeer: IBaseNPCBlueprint = {
  ...generateMoveAwayMovement(),
  name: "Red Deer",
  subType: NPCSubtype.Animal,
  key: NeutralNPCsBlueprint.RedDeer,
  textureKey: NeutralNPCsBlueprint.RedDeer,
  alignment: NPCAlignment.Neutral,
  attackType: EntityAttackType.Melee,
  speed: MovementSpeed.Standard,
  baseHealth: 30,
  healthRandomizerDice: Dice.D6,
  skills: {
    level: 3,
    strength: {
      level: 3,
    },
    dexterity: {
      level: 1,
    },
    resistance: {
      level: 5,
    },
  },
  loots: [
    {
      itemBlueprintKey: FoodsBlueprint.RedMeat,
      chance: 30,
      quantityRange: [1, 4],
    },
    {
      itemBlueprintKey: CraftingResourcesBlueprint.Leather,
      chance: 50,
      quantityRange: [1, 3],
    },
  ],
};
