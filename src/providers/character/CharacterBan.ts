import { Character, ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { NewRelic } from "@providers/analytics/NewRelic";
import { TrackNewRelicTransaction } from "@providers/analytics/decorator/TrackNewRelicTransaction";
import { DiscordBot } from "@providers/discord/DiscordBot";
import { SocketMessaging } from "@providers/sockets/SocketMessaging";
import { NewRelicMetricCategory, NewRelicSubCategory } from "@providers/types/NewRelicTypes";
import { CharacterSocketEvents } from "@rpg-engine/shared";
import dayjs from "dayjs";
import { provide } from "inversify-binding-decorators";

@provide(CharacterBan)
export class CharacterBan {
  constructor(private socketMessaging: SocketMessaging, private newRelic: NewRelic, private discordBot: DiscordBot) {}

  @TrackNewRelicTransaction()
  public async addPenalty(character: ICharacter): Promise<void> {
    // increment penalty by one
    character = (await Character.findOneAndUpdate(
      {
        _id: character._id,
      },
      {
        $inc: {
          penalty: 1,
        },
      },
      {
        new: true,
        returnOriginal: false,
      }
    )) as ICharacter;

    if (character.penalty % 10 === 0) {
      await Character.updateOne(
        { _id: character._id },
        {
          $set: {
            isBanned: true,
            isOnline: false,
            banRemovalDate: dayjs(new Date()).add(character.penalty, "day").toDate(),
          },
        }
      );

      this.socketMessaging.sendEventToUser(character.channelId!, CharacterSocketEvents.CharacterForceDisconnect, {
        reason: "Your character is now banned.",
      });

      if (character.penalty > 30) {
        await Character.updateOne({ _id: character._id }, { $set: { hasPermanentBan: true } });
      }
    }
    this.newRelic.trackMetric(NewRelicMetricCategory.Count, NewRelicSubCategory.Characters, "Penalty", 1);
  }

  @TrackNewRelicTransaction()
  public async banAntiMacroCharacters(character: ICharacter, penalty: number): Promise<void> {
    const updatedCharacter = await Character.findById(character._id).lean();

    if (!updatedCharacter || !updatedCharacter.isOnline) return;

    await this.discordBot.sendMessage(
      `Character ${character.name} has been banned for not answering the anti-macro properly.`,
      "bans"
    );

    character.penalty = penalty;
    character.isBanned = true;
    character.isOnline = false;
    character.banRemovalDate = dayjs(new Date()).add(character.penalty, "day").toDate();
    // eslint-disable-next-line mongoose-lean/require-lean
    await character.save();

    this.socketMessaging.sendEventToUser(character.channelId!, CharacterSocketEvents.CharacterForceDisconnect, {
      reason: "Your character is now banned.",
    });

    this.newRelic.trackMetric(NewRelicMetricCategory.Count, NewRelicSubCategory.Characters, "Banned", 1);
  }

  @TrackNewRelicTransaction()
  public async increasePenaltyAndBan(character: ICharacter): Promise<void> {
    character.penalty = Math.floor(character.penalty / 10) * 10 + 10;

    if (character.penalty % 10 === 0) {
      const updateData: Partial<ICharacter> = {
        penalty: character.penalty,
        isBanned: true,
        isOnline: false,
        banRemovalDate: dayjs().add(character.penalty, "day").toDate(),
      };

      if (character.penalty > 30) {
        updateData.hasPermanentBan = true;
      }

      await Character.updateOne({ _id: character._id }, updateData);

      this.socketMessaging.sendEventToUser(character.channelId!, CharacterSocketEvents.CharacterForceDisconnect, {
        reason: "Your character is now banned.",
      });

      this.newRelic.trackMetric(NewRelicMetricCategory.Count, NewRelicSubCategory.Characters, "Banned", 1);
    }
  }
}
