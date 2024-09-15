import { BattleCharacterAttack } from "@providers/battle/BattleCharacterAttack/BattleCharacterAttack";
import { appEnv } from "@providers/config/env";
import { MapTransitionQueue } from "@providers/map/MapTransition/MapTransitionQueue";
import { NPCMovementMoveTowards } from "@providers/npc/movement/NPCMovementMoveTowards";
import { NPCManager } from "@providers/npc/NPCManager";
import { provide } from "inversify-binding-decorators";

@provide(MessagingBrokerHandlers)
export class MessagingBrokerHandlers {
  constructor(
    private npcMovementMoveTowards: NPCMovementMoveTowards,
    private npcManager: NPCManager,
    private mapTransitionQueue: MapTransitionQueue,
    private battleCharacterAttack: BattleCharacterAttack
  ) {}

  public async onAddHandlers(): Promise<void> {
    const { MICROSERVICE_NAME } = appEnv.general;

    const IS_MICROSERVICE = !!MICROSERVICE_NAME;

    // rpg-api
    if (!IS_MICROSERVICE) {
      await this.mapTransitionQueue.addMapTransitionListener();
      await this.battleCharacterAttack.setupListeners();
    }

    // microservices
    switch (MICROSERVICE_NAME) {
      case "rpg-npc":
        console.log("💌 Adding messaging broker handlers");

        await this.npcMovementMoveTowards.addPathfindingResultsListener();
        await this.npcMovementMoveTowards.addLightweightPathfindingResultsListener();
        await this.npcManager.startBehaviorLoopListener();
        break;
    }
  }
}
