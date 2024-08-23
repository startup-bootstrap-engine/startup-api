import { Character, ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { InternalRequestMiddleware } from "@providers/middlewares/InternalRequestMiddleware";
import { NPCManager } from "@providers/npc/NPCManager";
import { controller, httpPost, interfaces, requestBody } from "inversify-express-utils";

interface IRequest {
  characterId: string;
}

@controller("/npcs", InternalRequestMiddleware)
export class NPCController implements interfaces.Controller {
  constructor(private npcManager: NPCManager) {}

  @httpPost("/start-behavior-loop")
  private async startNearbyNPCsBehaviorLoop(@requestBody() body: IRequest): Promise<void> {
    const { characterId } = body;

    if (!characterId) {
      return;
    }

    const character = await Character.findById(characterId).lean<ICharacter>();

    await this.npcManager.startNearbyNPCsBehaviorLoop(character);
  }
}
