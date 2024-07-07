import { Character, ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { CharacterPvPKillLog } from "@entities/ModuleCharacter/CharacterPvPKillLogModel";
import { TrackNewRelicTransaction } from "@providers/analytics/decorator/TrackNewRelicTransaction";
import {
  CHARACTER_SKULL_AMOUNT_KILLS_NEEDED_TO_RED_SKULL,
  CHARACTER_SKULL_AMOUNT_KILLS_NEEDED_TO_YELLOW_SKULL,
  CHARACTER_SKULL_MAX_TIME_UNTIL_UPGRADE_TO_RED_SKULL,
  CHARACTER_SKULL_RED_SKULL_DURATION,
  CHARACTER_SKULL_WHITE_SKULL_DURATION,
  CHARACTER_SKULL_YELLOW_SKULL_DURATION,
} from "@providers/constants/CharacterSkullConstants";
import { InMemoryHashTable } from "@providers/database/InMemoryHashTable";
import { PartyValidator } from "@providers/party/PartyValidator";
import { SocketMessaging } from "@providers/sockets/SocketMessaging";
import { CharacterSkullType, CharacterSocketEvents, ICharacterAttributeChanged, Modes } from "@rpg-engine/shared";
import dayjs from "dayjs";
import { provide } from "inversify-binding-decorators";

@provide(CharacterSkull)
export class CharacterSkull {
  constructor(
    private readonly inMemoryHashTable: InMemoryHashTable,
    private readonly socketMessaging: SocketMessaging,
    private partyValidator: PartyValidator
  ) {}

  @TrackNewRelicTransaction()
  public async checkForUnjustifiedAttack(character: ICharacter, target: ICharacter): Promise<boolean> {
    // avoid getting a skull on the arena map
    if (character.scene.includes("arena")) {
      return false;
    }

    // Check if the caster is in a party
    const isCharacterAndTargetInParty = await this.partyValidator.checkIfCharacterAndTargetOnTheSameParty(
      character as ICharacter,
      target as ICharacter
    );

    return target.hasSkull !== true && target.faction === character.faction && isCharacterAndTargetInParty !== true;
  }

  @TrackNewRelicTransaction()
  public async updateWhiteSkull(characterId: string, targetId: string): Promise<void> {
    try {
      // eslint-disable-next-line mongoose-lean/require-lean
      const character = await Character.findOne({ _id: characterId });
      if (!character) {
        return;
      }

      // Only checking for white skull, if yellow + red skull => skip this
      if (character.hasSkull && character.skullType !== CharacterSkullType.WhiteSkull) {
        return;
      }

      const namespace = `last_pvp:${character._id}`;
      if (!character.hasSkull) {
        await this.setSkull(character, CharacterSkullType.WhiteSkull);
      } else if (character.skullType === CharacterSkullType.WhiteSkull) {
        // Check if character attack another player
        const lastTargetId = await this.checkLastPvPTargetId(character._id.toString());
        if (lastTargetId !== targetId) {
          await this.setSkull(character, CharacterSkullType.WhiteSkull);
        }
      }
      // Set the last attack target
      await this.inMemoryHashTable.set(namespace, character._id.toString(), targetId);
      await this.inMemoryHashTable.expire(namespace, CHARACTER_SKULL_WHITE_SKULL_DURATION / 1000, "NX");
    } catch (err) {
      console.error(`An error occurred while trying to update skull to character ${characterId}`, err);
    }
  }

  private getSkullText(character: ICharacter, skull: string | undefined): string {
    const modeText =
      character.mode === Modes.SoftMode
        ? "Even in Soft Mode, you'll now incur HARDCORE mode penalties upon death."
        : "";

    if (!skull) return "";
    switch (skull as CharacterSkullType) {
      case CharacterSkullType.WhiteSkull:
        return `White Skull: Expires in 15 mins. ${modeText}`;
      case CharacterSkullType.YellowSkull:
        return "Yellow Skull: 1-week expiry, 30% more XP/SP loss, 30% loot drop increase on death.";
      case CharacterSkullType.RedSkull:
        return "Red Skull: 2-weeks expiry, 2x XP/SP loss, full loot drop on death.";
      default:
        throw new Error("Invalid Skull");
    }
  }

  private async sendSkullEventToUser(character: ICharacter): Promise<void> {
    const payload: ICharacterAttributeChanged = {
      targetId: character._id,
      hasSkull: true,
      skullType: character.skullType as CharacterSkullType,
    };

    await this.socketMessaging.sendEventToCharactersAroundCharacter(
      character,
      CharacterSocketEvents.AttributeChanged,
      payload,
      true
    );
    this.socketMessaging.sendMessageToCharacter(character, this.getSkullText(character, character.skullType));
  }

  private async checkLastPvPTargetId(characterId: string): Promise<string | null> {
    const namespace = `last_pvp:${characterId}`;
    const lastTargetId = await this.inMemoryHashTable.get(namespace, characterId);
    if (typeof lastTargetId === "string") {
      return lastTargetId as string;
    }

    return null;
  }

  public async setSkull(character: ICharacter, skullType: CharacterSkullType): Promise<void> {
    let timeExpired = new Date();
    switch (skullType) {
      case CharacterSkullType.WhiteSkull:
        timeExpired = dayjs().add(CHARACTER_SKULL_WHITE_SKULL_DURATION, "millisecond").toDate();
        break;
      case CharacterSkullType.YellowSkull:
        timeExpired = dayjs().add(CHARACTER_SKULL_YELLOW_SKULL_DURATION, "millisecond").toDate();
        break;
      case CharacterSkullType.RedSkull:
        timeExpired = dayjs().add(CHARACTER_SKULL_RED_SKULL_DURATION, "millisecond").toDate();
        break;
    }
    await Character.updateOne(
      { _id: character._id },
      {
        $set: {
          hasSkull: true,
          skullType: skullType,
          skullExpiredAt: timeExpired,
        },
      }
    );

    character.skullType = skullType;

    await this.sendSkullEventToUser(character);
  }

  @TrackNewRelicTransaction()
  public async updateSkullAfterKill(characterId: string): Promise<void> {
    // eslint-disable-next-line mongoose-lean/require-lean
    const character = await Character.findById(characterId);
    if (!character || !character.skullExpiredAt) return;

    // Reset kill count if skull expired and was yellow or red
    if (
      character.skullExpiredAt < new Date() &&
      (character.skullType === CharacterSkullType.YellowSkull || character.skullType === CharacterSkullType.RedSkull)
    ) {
      await this.resetSkull(characterId);
    }

    if (character.hasSkull && character.skullType === CharacterSkullType.RedSkull) {
      // always reset timer when kill with red skull
      await this.setSkull(character, CharacterSkullType.RedSkull);
      return;
    }

    // check if character upgrade to red skull
    const totalKillCount10Days = await CharacterPvPKillLog.countDocuments({
      killer: characterId,
      isJustify: false,
      createdAt: {
        $gte: dayjs().subtract(CHARACTER_SKULL_MAX_TIME_UNTIL_UPGRADE_TO_RED_SKULL, "millisecond").toDate(),
      },
    });

    if (totalKillCount10Days > CHARACTER_SKULL_AMOUNT_KILLS_NEEDED_TO_RED_SKULL) {
      // set red skull when total kill in 10 days > 3
      await this.setSkull(character, CharacterSkullType.RedSkull);
    } else {
      const totalKillCount7Days = await CharacterPvPKillLog.countDocuments({
        killer: characterId,
        isJustify: false,
        createdAt: { $gte: dayjs().subtract(CHARACTER_SKULL_YELLOW_SKULL_DURATION, "millisecond").toDate() },
      });
      // if total kill > 1 => set Yellow skull and reset timer
      if (totalKillCount7Days > CHARACTER_SKULL_AMOUNT_KILLS_NEEDED_TO_YELLOW_SKULL) {
        await this.setSkull(character, CharacterSkullType.YellowSkull);
      }
    }
  }

  private async resetSkull(characterId: string): Promise<void> {
    await Character.updateOne(
      { _id: characterId },
      {
        $set: {
          hasSkull: false,
        },
        $unset: {
          skullType: "",
          skullExpiredAt: "",
        },
      }
    );
  }
}
