import { Character, ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { NewRelic } from "@providers/analytics/NewRelic";
import { CharacterLastAction } from "@providers/character/CharacterLastAction";
import { CharacterRetentionTracker } from "@providers/character/CharacterRetentionTracker";
import { SERVER_DISCONNECT_IDLE_TIMEOUT } from "@providers/constants/ServerConstants";
import { SocketAdapter } from "@providers/sockets/SocketAdapter";
import { SocketMessaging } from "@providers/sockets/SocketMessaging";
import { SocketSessionControl } from "@providers/sockets/SocketSessionControl";
import { NewRelicMetricCategory, NewRelicSubCategory } from "@providers/types/NewRelicTypes";
import { CharacterSocketEvents, ICharacterAttributeChanged } from "@rpg-engine/shared";
import dayjs from "dayjs";
import { provide } from "inversify-binding-decorators";
import { CronJobScheduler } from "./CronJobScheduler";

@provide(CharacterCrons)
export class CharacterCrons {
  constructor(
    private socketMessaging: SocketMessaging,
    private characterLastAction: CharacterLastAction,
    private newRelic: NewRelic,
    private socketAdapter: SocketAdapter,
    private socketSessionControl: SocketSessionControl,
    private cronJobScheduler: CronJobScheduler,
    private characterRetentionTracker: CharacterRetentionTracker
  ) {}

  public schedule(): void {
    // every 15 min, check how many players are online

    this.cronJobScheduler.uniqueSchedule("character-cron-online-character-check", "*/15 * * * *", async () => {
      const onlineCharactersCount = await Character.countDocuments({
        isOnline: true,
      });

      this.newRelic.trackMetric(
        NewRelicMetricCategory.Count,
        NewRelicSubCategory.Characters,
        "Online",
        onlineCharactersCount
      );
    });

    this.cronJobScheduler.uniqueSchedule("character-cron-track-average-total-days-played", "0 */4 * * *", async () => {
      await this.characterRetentionTracker.trackAverageTotalDaysPlayed();
    });

    this.cronJobScheduler.uniqueSchedule("character-cron-logout-inactive-characters", "* * * * *", async () => {
      await this.logoutInactiveCharacters();
    });

    this.cronJobScheduler.uniqueSchedule("character-cron-unban-characters", "0 0 * * *", async () => {
      await this.unbanCharacters();
    });

    this.cronJobScheduler.uniqueSchedule("character-cron-clean-skull-from-character", "* * * * *", async () => {
      await this.cleanSkullCharacters();
    });
  }

  private async unbanCharacters(): Promise<void> {
    const bannedCharacters = await Character.find({
      isBanned: true,
      hasPermanentBan: {
        $ne: true,
      },
      banRemovalDate: {
        $lte: new Date(),
      },
    });

    for (const bannedCharacter of bannedCharacters) {
      console.log(`💡 Character id ${bannedCharacter.id} has been unbanned...`);
      bannedCharacter.isBanned = false;
      await bannedCharacter.save();
    }
  }

  private async logoutInactiveCharacters(): Promise<void> {
    const onlineCharacters = (await Character.find({
      isOnline: true,
    }).lean()) as ICharacter[];

    for (const character of onlineCharacters) {
      const dateString = await this.characterLastAction.getLastAction(character._id);

      let date = dayjs(dateString).toDate();

      if (date === undefined) {
        date = character.updatedAt;
      }

      const lastActivity = dayjs(date);

      const now = dayjs();

      const diff = now.diff(lastActivity, "minute");

      if (diff >= SERVER_DISCONNECT_IDLE_TIMEOUT) {
        console.log(`🚪: Character id ${character._id} (${character.name}) has disconnected due to inactivity...`);
        this.socketMessaging.sendEventToUser(character.channelId!, CharacterSocketEvents.CharacterForceDisconnect, {
          reason: "You have were disconnected due to inactivity!",
        });

        await this.socketMessaging.sendEventToCharactersAroundCharacter(
          character,
          CharacterSocketEvents.CharacterLogout,
          {
            id: character.id,
          }
        );

        (await Character.findByIdAndUpdate({ _id: character._id }, { isOnline: false })) as ICharacter;

        // leave character channel
        await this.socketAdapter.getChannelById(character.channelId!)?.leave(character.channelId!);

        await this.socketSessionControl.deleteSession(character._id!);

        await this.characterLastAction.clearLastAction(character._id);

        this.newRelic.trackMetric(
          NewRelicMetricCategory.Count,
          NewRelicSubCategory.Characters,
          "CharacterInactiveLogOut",
          1
        );
      }
    }
  }

  private async cleanSkullCharacters(): Promise<void> {
    const now = new Date();

    const charactersWithSkull = (await Character.find({
      skullExpiredAt: { $lt: now },
      hasSkull: true,
    }).lean()) as ICharacter[];

    if (charactersWithSkull.length === 0) return;

    // Prepare the bulk update operation
    const bulkOps = charactersWithSkull.map((character) => ({
      updateOne: {
        filter: { _id: character._id },
        update: {
          $set: { hasSkull: false },
          $unset: { skullType: "", skullExpiredAt: "" },
        },
      },
    }));

    // Execute the bulk update
    await Character.bulkWrite(bulkOps);

    // Send socket messages
    for (const character of charactersWithSkull) {
      const payload: ICharacterAttributeChanged = {
        targetId: character._id,
        hasSkull: false,
      };

      await this.socketMessaging.sendEventToCharactersAroundCharacter(
        character,
        CharacterSocketEvents.AttributeChanged,
        payload,
        true
      );
      this.socketMessaging.sendMessageToCharacter(character, "Your skull was dismissed!");
    }
  }
}
