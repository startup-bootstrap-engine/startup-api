import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { provideSingleton } from "@providers/inversify/provideSingleton";
import { DynamicQueue } from "@providers/queue/DynamicQueue";
import { SocketAuth } from "@providers/sockets/SocketAuth";
import { SocketChannel } from "@providers/sockets/SocketsTypes";
import { ISpellCast, SpellSocketEvents } from "@rpg-engine/shared";
import { SpellCast } from "../SpellCast";

@provideSingleton(SpellNetworkCastQueue)
export class SpellNetworkCastQueue {
  constructor(private socketAuth: SocketAuth, private spellCast: SpellCast, private dynamicQueue: DynamicQueue) {}

  public onSpellCast(channel: SocketChannel): void {
    this.socketAuth.authCharacterOn(
      channel,
      SpellSocketEvents.CastSpell,
      async (data: ISpellCast, character: ICharacter) => {
        if (!character._id) {
          throw new Error("Character ID not found");
        }

        if (character.health <= 0) {
          throw new Error("Character is not alive");
        }

        if (!data || !character) {
          return;
        }

        await this.addToQueue(data, character);
      },
      true
    );
  }

  public async addToQueue(data: ISpellCast, character: ICharacter): Promise<void> {
    await this.dynamicQueue.addJob(
      "spell-cast",
      async (job) => {
        const { data, character } = job.data;

        await this.spellCast.castSpell(data, character);
      },
      {
        character,
        data,
      }
    );
  }

  public async clearAllJobs(): Promise<void> {
    await this.dynamicQueue.clearAllJobs();
  }

  public async shutdown(): Promise<void> {
    await this.dynamicQueue.shutdown();
  }
}
