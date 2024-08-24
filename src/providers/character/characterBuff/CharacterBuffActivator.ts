import { CharacterBuff } from "@entities/ModuleCharacter/CharacterBuffModel";
import { Character, ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { TrackNewRelicTransaction } from "@providers/analytics/decorator/TrackNewRelicTransaction";
import {
  CharacterBuffDurationType,
  CharacterBuffType,
  ICharacterBuff,
  ICharacterPermanentBuff,
  ICharacterTemporaryBuff,
} from "@rpg-engine/shared";
import { provide } from "inversify-binding-decorators";
import { CharacterBuffAttribute } from "./CharacterBuffAttribute";
import { CharacterBuffSkill } from "./CharacterBuffSkill";
import { CharacterBuffTracker } from "./CharacterBuffTracker";

@provide(CharacterBuffActivator)
export class CharacterBuffActivator {
  constructor(
    private characterBuffCharacterAttribute: CharacterBuffAttribute,
    private characterBuffSkill: CharacterBuffSkill,
    private characterBuffTracker: CharacterBuffTracker
  ) {}

  @TrackNewRelicTransaction()
  public async enableTemporaryBuff(
    character: ICharacter,
    buff: ICharacterTemporaryBuff
  ): Promise<ICharacterBuff | undefined> {
    let noMessage;

    if (!buff.isStackable && buff.originateFrom) {
      const existingBuffs = await this.findExistingBuff(character, buff);

      const sameOriginBuffs = existingBuffs?.filter(
        (existingBuff) => existingBuff.originateFrom === buff.originateFrom
      );

      if (sameOriginBuffs && sameOriginBuffs.length > 0) {
        await Promise.all(
          sameOriginBuffs.map(async (buff) => {
            await this.disableBuff(character, buff._id!, buff.type, true);
          })
        );

        noMessage = true;
      }
    }

    return await this.enableBuff(character, buff, noMessage);
  }

  @TrackNewRelicTransaction()
  public async enablePermanentBuff(
    character: ICharacter,
    buff: ICharacterPermanentBuff,
    noMessage?: boolean
  ): Promise<ICharacterBuff | undefined> {
    return await this.enableBuff(character, buff, noMessage);
  }

  @TrackNewRelicTransaction()
  public async disableBuff(
    character: ICharacter,
    buffId: string,
    type: CharacterBuffType,
    noMessage?: boolean
  ): Promise<boolean | undefined> {
    return type === CharacterBuffType.CharacterAttribute
      ? await this.characterBuffCharacterAttribute.disableBuff(character, buffId, noMessage)
      : await this.characterBuffSkill.disableBuff(character, buffId, noMessage);
  }

  @TrackNewRelicTransaction()
  public async disableAllBuffs(character: ICharacter, durationType: CharacterBuffDurationType | "all"): Promise<void> {
    const buffs = await this.characterBuffTracker.getAllCharacterBuffs(character._id);
    for (const buff of buffs) {
      if (durationType === "all" || buff.durationType === durationType) {
        await this.disableBuff(character, buff._id!, buff.type);
      }
    }
  }

  @TrackNewRelicTransaction()
  public async disableAllTemporaryBuffsAllCharacters(): Promise<void> {
    const temporaryBuffs = await CharacterBuff.find({ durationType: CharacterBuffDurationType.Temporary }).lean();
    for (const buff of temporaryBuffs) {
      const character = (await Character.findById(buff.owner).lean()) as ICharacter;
      if (character) {
        await this.disableBuff(character, buff._id, buff.type as CharacterBuffType);
      }
    }
  }

  private async enableBuff(
    character: ICharacter,
    buff: ICharacterPermanentBuff | ICharacterTemporaryBuff,
    noMessage?: boolean
  ): Promise<ICharacterBuff | undefined> {
    const enabledBuff = await (buff.type === CharacterBuffType.CharacterAttribute
      ? this.characterBuffCharacterAttribute.enableBuff(character, buff, noMessage)
      : this.characterBuffSkill.enableBuff(character, buff, noMessage));
    if (!enabledBuff) {
      throw new Error(`Failed to enable buff with details ${JSON.stringify(buff)}`);
    }

    this.handleTemporaryBuffExpiration(character, enabledBuff as ICharacterTemporaryBuff, noMessage || false);
    return enabledBuff;
  }

  private async findExistingBuff(
    character: ICharacter,
    buff: ICharacterTemporaryBuff
  ): Promise<ICharacterBuff[] | null> {
    return await CharacterBuff.find({
      owner: character.id,
      originateFrom: buff.originateFrom,
    }).lean();
  }

  private handleTemporaryBuffExpiration(
    character: ICharacter,
    buff: ICharacterTemporaryBuff,
    noMessage: boolean
  ): void {
    if (buff.durationType === CharacterBuffDurationType.Temporary && buff.durationSeconds) {
      setTimeout(async () => {
        await this.disableBuff(character, buff._id!, buff.type, noMessage);
      }, buff.durationSeconds * 1000);
    }
  }
}
