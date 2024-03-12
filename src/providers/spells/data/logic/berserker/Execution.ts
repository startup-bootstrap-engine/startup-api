import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { INPC } from "@entities/ModuleNPC/NPCModel";
import { TrackNewRelicTransaction } from "@providers/analytics/decorator/TrackNewRelicTransaction";
import { CharacterDeath } from "@providers/character/CharacterDeath";
import { NPCDeathQueue } from "@providers/npc/NPCDeathQueue";
import { SocketMessaging } from "@providers/sockets/SocketMessaging";
import { EntityType } from "@rpg-engine/shared";
import { provide } from "inversify-binding-decorators";

@provide(Execution)
export class Execution {
  constructor(
    private npcDeath: NPCDeathQueue,
    private characterDeath: CharacterDeath,
    private socketMessaging: SocketMessaging
  ) {}

  @TrackNewRelicTransaction()
  public async handleExecution(attacker: ICharacter, target: ICharacter | INPC): Promise<boolean> {
    if (!attacker || !target) {
      console.debug(`Invalid attacker or target: ${attacker} - ${target}`);
      return false;
    }

    const targetId = target?._id;
    const targetType = target?.type as EntityType;

    try {
      if (!attacker || !targetId || !targetType) {
        throw new Error("Invalid parameters");
      }

      if (attacker._id.toString() === targetId.toString()) {
        return false;
      }

      if (targetType !== EntityType.Character && targetType !== EntityType.NPC) {
        throw new Error("Invalid entityType provided");
      }

      const healthPercent = Math.floor((100 * target.health) / target.maxHealth);

      if (healthPercent > 30) {
        this.socketMessaging.sendErrorMessageToCharacter(
          attacker,
          "The target's health is above 30%, you can't execute it."
        );
        return false;
      }

      switch (targetType) {
        case EntityType.Character:
          await this.characterDeath.handleCharacterDeath(attacker, target as ICharacter);
          break;
        case EntityType.NPC:
          await this.npcDeath.handleNPCDeath(attacker as ICharacter, target as INPC);
          break;
      }

      return false;
    } catch (error) {
      console.error(error);
      throw new Error(`Error executing attack: ${error.message}`);
    }
  }
}
