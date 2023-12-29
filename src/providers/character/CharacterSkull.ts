import { Character, ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { CharacterParty } from "@entities/ModuleCharacter/CharacterPartyModel";
import { CharacterPvPKillLog } from "@entities/ModuleCharacter/CharacterPvPKillLogModel";
import { TrackNewRelicTransaction } from "@providers/analytics/decorator/TrackNewRelicTransaction";
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
      await this.inMemoryHashTable.expire(namespace, 15 * 60, "NX");
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
        timeExpired = new Date(Date.now() + 15 * 60 * 1000);

        break;
      case CharacterSkullType.YellowSkull:
        timeExpired = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        break;
      case CharacterSkullType.RedSkull:
        timeExpired = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
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
    if (!character) {
      return;
    }

    if (character.hasSkull && character.skullType === CharacterSkullType.RedSkull) {
      // always reset timer when kill with red skull
      await this.setSkull(character, CharacterSkullType.RedSkull);
      return;
    }

    // check if character upgrage to red skull
    const totalKillCount10Days = await CharacterPvPKillLog.countDocuments({
      killer: characterId,
      isJustify: false,
      createdAt: {
        $gte: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      },
    });
    if (totalKillCount10Days > 3) {
      // set red skull when total kill in 10 days > 3
      await this.setSkull(character, CharacterSkullType.RedSkull);
    } else {
      const totalKillCount7Days = await CharacterPvPKillLog.countDocuments({
        killer: characterId,
        isJustify: false,
        createdAt: {
          $gte: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        },
      });
      // if total kill > 1 => set Yellow skull and reset timer
      if (totalKillCount7Days > 1) {
        await this.setSkull(character, CharacterSkullType.YellowSkull);
      }
    }
  }
}
