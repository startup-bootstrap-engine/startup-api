import { Character, ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { CharacterParty } from "@entities/ModuleCharacter/CharacterPartyModel";
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
import { SocketMessaging } from "@providers/sockets/SocketMessaging";
import { CharacterSkullType, CharacterSocketEvents, ICharacterAttributeChanged, Modes } from "@rpg-engine/shared";
import { provide } from "inversify-binding-decorators";

@provide(CharacterSkull)
export class CharacterSkull {
  constructor(
    private readonly inMemoryHashTable: InMemoryHashTable,
    private readonly socketMessaging: SocketMessaging
  ) {}

  @TrackNewRelicTransaction()
  public async checkForUnjustifiedAttack(character: ICharacter, target: ICharacter): Promise<boolean> {
    // Check if the caster is in a party
    const isCharacterAndTargetInParty = await this.isCharacterAndTargetOnTheSameParty(
      character as ICharacter,
      target as ICharacter
    );

    return target.hasSkull !== true && target.faction === character.faction && isCharacterAndTargetInParty !== true;
  }

  private async isCharacterAndTargetOnTheSameParty(character: ICharacter, target: ICharacter): Promise<boolean> {
    // First, find a party where the character is the leader and target is a member
    const partyWithCharacterAsLeader = await CharacterParty.findOne({
      "leader._id": character._id,
      "members._id": target._id,
    }).lean();

    // If found, it means they are in the same party
    if (partyWithCharacterAsLeader) {
      return true;
    }

    // Next, find a party where the target is the leader and character is a member
    const partyWithTargetAsLeader = await CharacterParty.findOne({
      "leader._id": target._id,
      "members._id": character._id,
    }).lean();

    // If found, it means they are in the same party
    if (partyWithTargetAsLeader) {
      return true;
    }
    // If neither condition is met, then they are not in the same party
    return false;
  }

  @TrackNewRelicTransaction()
  public async updateWhiteSkull(characterId: string, targetId: string): Promise<void> {
    try {
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

  private async setSkull(character: ICharacter, skullType: CharacterSkullType): Promise<void> {
    let timeExpired = new Date();
    switch (skullType) {
      case CharacterSkullType.WhiteSkull:
        timeExpired = new Date(Date.now() + CHARACTER_SKULL_WHITE_SKULL_DURATION);
        break;
      case CharacterSkullType.YellowSkull:
        timeExpired = new Date(Date.now() + CHARACTER_SKULL_YELLOW_SKULL_DURATION);
        break;
      case CharacterSkullType.RedSkull:
        timeExpired = new Date(Date.now() + CHARACTER_SKULL_RED_SKULL_DURATION);
        break;
    }
    character.hasSkull = true;
    character.skullType = skullType;
    character.skullExpiredAt = timeExpired;
    await character.save();
    await this.sendSkullEventToUser(character);

    // send skull warning
  }

  @TrackNewRelicTransaction()
  public async updateSkullAfterKill(characterId: string): Promise<void> {
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
        $gte: new Date(Date.now() - CHARACTER_SKULL_MAX_TIME_UNTIL_UPGRADE_TO_RED_SKULL),
      },
    });

    if (totalKillCount10Days > CHARACTER_SKULL_AMOUNT_KILLS_NEEDED_TO_RED_SKULL) {
      // set red skull when total kill in 10 days > 3
      await this.setSkull(character, CharacterSkullType.RedSkull);
    } else {
      const totalKillCount7Days = await CharacterPvPKillLog.countDocuments({
        killer: characterId,
        isJustify: false,
        createdAt: {
          $gte: new Date(Date.now() - CHARACTER_SKULL_YELLOW_SKULL_DURATION),
        },
      });
      // if total kill > 1 => set Yellow skull and reset timer
      if (totalKillCount7Days > CHARACTER_SKULL_AMOUNT_KILLS_NEEDED_TO_YELLOW_SKULL) {
        await this.setSkull(character, CharacterSkullType.YellowSkull);
      }
    }
  }

  private async resetSkull(characterId: string): Promise<void> {
    console.log(`Reseting skull from player ${characterId}`);
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
