import { INPC } from "@entities/ModuleNPC/NPCModel";
import { rollDice } from "@providers/constants/DiceConstants";
import { provide } from "inversify-binding-decorators";

@provide(NPCHealthManaCalculator)
export class NPCHealthManaCalculator {
  public getNPCMaxHealthRandomized(npc: INPC): number {
    let maxHealth;

    if (npc.healthRandomizerDice && npc.baseHealth) {
      maxHealth = npc.baseHealth + rollDice(npc.healthRandomizerDice);
    } else {
      maxHealth = npc.maxHealth;
    }

    return maxHealth;
  }
}
