import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { CharacterBuffSkill } from "@providers/character/characterBuff/CharacterBuffSkill";
import { InMemoryHashTable } from "@providers/database/InMemoryHashTable";
import { SocketAuth } from "@providers/sockets/SocketAuth";
import { SocketMessaging } from "@providers/sockets/SocketMessaging";
import { SocketChannel } from "@providers/sockets/SocketsTypes";
import { IUIShowMessage, SkillSocketEvents, UISocketEvents } from "@rpg-engine/shared";
import { provide } from "inversify-binding-decorators";
import { clearCacheForKey } from "speedgoose";
import { SkillBuffQueue } from "../SkillBuff";

@provide(SkillNetworkReadInfo)
export class SkillNetworkReadInfo {
  constructor(
    private socketAuth: SocketAuth,
    private socketMessaging: SocketMessaging,
    private characterBuffSkill: CharacterBuffSkill,
    private skillBuff: SkillBuffQueue,
    private inMemoryHashTable: InMemoryHashTable
  ) {}

  public onGetInfo(channel: SocketChannel): void {
    this.socketAuth.authCharacterOn(channel, SkillSocketEvents.ReadInfo, async (data, character: ICharacter) => {
      await clearCacheForKey(`${character._id}-skills`);
      await this.inMemoryHashTable.delete("skills-with-buff", character._id);

      const skill = await this.skillBuff.getSkillsWithBuff(character);

      if (!skill) {
        this.socketMessaging.sendEventToUser<IUIShowMessage>(character.channelId!, UISocketEvents.ShowMessage, {
          message: "Skill not found.",
          type: "error",
        });
        return false;
      }

      const buffs = await this.characterBuffSkill.calculateAllActiveBuffs(character);

      this.socketMessaging.sendEventToUser(character.channelId!, SkillSocketEvents.ReadInfo, {
        skill,
        buffs,
      });
    });
  }
}
