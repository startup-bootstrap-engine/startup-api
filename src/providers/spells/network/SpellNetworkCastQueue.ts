import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { provideSingleton } from "@providers/inversify/provideSingleton";
import { MultiQueue } from "@providers/queue/MultiQueue";
import { SocketAuth } from "@providers/sockets/SocketAuth";
import { SocketChannel } from "@providers/sockets/SocketsTypes";
import { ISpellCast, SpellSocketEvents } from "@rpg-engine/shared";
import { SpellCast } from "../SpellCast";

@provideSingleton(SpellNetworkCastQueue)
export class SpellNetworkCastQueue {
  constructor(private socketAuth: SocketAuth, private spellCast: SpellCast, private multiQueue: MultiQueue) {}

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
    await this.multiQueue.addJob(
      "spell-cast",
      async (job) => {
        const { data, character } = job.data;

        await this.spellCast.castSpell(data, character);
      },
      {
        character,
        data,
      },
      {
        queueScaleBy: "active-characters",
      }
    );
  }

  public async clearAllJobs(): Promise<void> {
    await this.multiQueue.clearAllJobs();
  }

  public async shutdown(): Promise<void> {
    await this.multiQueue.shutdown();
  }
}
