import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { INPC } from "@entities/ModuleNPC/NPCModel";
import { TrackNewRelicTransaction } from "@providers/analytics/decorator/TrackNewRelicTransaction";
import { CharacterDeath } from "@providers/character/CharacterDeath/CharacterDeath";
import { EXECUTION_DEFAULT_HEALTH_THRESHOLD } from "@providers/constants/BattleConstants";
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
  public async handleExecution(
    attacker: ICharacter,
    target: ICharacter | INPC,
    targetHealthThreshold: number = EXECUTION_DEFAULT_HEALTH_THRESHOLD
  ): Promise<boolean> {
    try {
      if (!attacker || !target) {
        console.debug("Invalid attacker or target:", attacker, target);
        return false;
      }

      // Set default type if missing
      if (!target.type) {
        target.type = (target as INPC).isBehaviorEnabled !== undefined ? EntityType.NPC : EntityType.Character;
      }

      // Validate target type
      if (target.type !== EntityType.Character && target.type !== EntityType.NPC) {
        throw new Error("Invalid entityType provided");
      }

      const targetId = target?._id;
      const targetType = target?.type as EntityType;

      if (!attacker._id || !targetId || !targetType) {
        console.error("Invalid parameters detected:", {
          attackerId: attacker._id,
          targetId,
          targetType,
        });
        this.socketMessaging.sendErrorMessageToCharacter(
          attacker,
          "Sorry, an error occurred while executing the attack."
        );
        return false;
      }

      if (attacker._id.toString() === targetId.toString()) {
        return false;
      }

      const healthPercent = Math.floor((100 * target.health) / target.maxHealth);

      if (healthPercent > targetHealthThreshold) {
        this.socketMessaging.sendErrorMessageToCharacter(
          attacker,
          `The target's health is above ${targetHealthThreshold}%, you can't execute it.`
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

      return true;
    } catch (error) {
      console.error("Error details:", error, { attacker, target, targetHealthThreshold });

      return false;
    }
  }
}
