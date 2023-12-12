import { INPC } from "@entities/ModuleNPC/NPCModel";
import { rollDice } from "@providers/constants/DiceConstants";
import { provide } from "inversify-binding-decorators";

@provide(NPCHealthManaCalculator)
export class NPCHealthManaCalculator {
  public getNPCMaxHealthRandomized(npc: INPC): number {
    if (npc.healthRandomizerDice && npc.baseHealth) {
      return npc.baseHealth + rollDice(npc.healthRandomizerDice);
    }

    return npc.maxHealth;
  }
}
