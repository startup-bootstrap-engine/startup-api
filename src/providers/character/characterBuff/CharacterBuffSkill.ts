import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { Skill } from "@entities/ModuleCharacter/SkillsModel";
import { TrackNewRelicTransaction } from "@providers/analytics/decorator/TrackNewRelicTransaction";
import { SkillBuffQueue } from "@providers/skill/SkillBuffQueue";
import { SocketMessaging } from "@providers/sockets/SocketMessaging";
import { TextFormatter } from "@providers/text/TextFormatter";
import { ICharacterBuff, ISkillDetails, SkillSocketEvents } from "@rpg-engine/shared";
import { provide } from "inversify-binding-decorators";
import { IBuffValueCalculations } from "./CharacterBuffAttribute";
import { CharacterBuffTracker } from "./CharacterBuffTracker";

@provide(CharacterBuffSkill)
export class CharacterBuffSkill {
  constructor(
    private characterBuffTracker: CharacterBuffTracker,
    private socketMessaging: SocketMessaging,
    private textFormatter: TextFormatter,
    private skillBuff: SkillBuffQueue
  ) {}

  @TrackNewRelicTransaction()
  public async enableBuff(character: ICharacter, buff: ICharacterBuff, noMessage = false): Promise<ICharacterBuff> {
    const { buffAbsoluteChange } = await this.performBuffValueCalculations(character, buff);

    buff.absoluteChange = buffAbsoluteChange;
    const addedBuff = await this.characterBuffTracker.addBuff(character._id, buff);

    if (!addedBuff) {
      throw new Error("Could not add buff to character");
    }

    await this.sendUpdateToClient(character, buff, "activation", noMessage);
    return addedBuff;
  }

  @TrackNewRelicTransaction()
  public async disableBuff(character: ICharacter, buffId: string, noMessage = false): Promise<boolean> {
    const buff = await this.characterBuffTracker.getBuff(character._id, buffId);

    if (!buff) {
      return false;
    }

    const hasDeletedBuff = await this.characterBuffTracker.deleteBuff(character, buff._id!, buff.trait!);

    if (!hasDeletedBuff) {
      throw new Error("Could not delete buff from character");
    }

    await this.sendUpdateToClient(character, buff, "deactivation", noMessage);
    return true;
  }

  @TrackNewRelicTransaction()
  private async performBuffValueCalculations(
    character: ICharacter,
    buff: ICharacterBuff
  ): Promise<IBuffValueCalculations> {
    if (!character) {
      throw new Error("Character not found");
    }

    const [totalTraitSummedBuffs, updatedSkills] = await Promise.all([
      this.characterBuffTracker.getAllBuffPercentageChanges(character?._id, buff.trait),
      Skill.findOne({ owner: character._id }).lean(),
    ]);

    if (!updatedSkills) {
      throw new Error("Skills not found");
    }

    const skillDetails = updatedSkills[buff.trait] as ISkillDetails;
    const baseTraitValue = Number(skillDetails.level.toFixed(2));
    const updatedTraitValue = Number((baseTraitValue * (1 + totalTraitSummedBuffs / 100)).toFixed(2));
    const buffAbsoluteChange = Number((updatedTraitValue - baseTraitValue).toFixed(2));

    return { baseTraitValue, buffAbsoluteChange, updatedTraitValue };
  }

  @TrackNewRelicTransaction()
  private async sendUpdateToClient(
    character: ICharacter,
    buff: ICharacterBuff,
    type: "activation" | "deactivation",
    noMessage: boolean
  ): Promise<void> {
    const [skill, buffs] = await Promise.all([
      this.skillBuff.getSkillsWithBuff(character),
      this.calculateAllActiveBuffs(character),
    ]);

    if (!skill) {
      throw new Error("Skill not found");
    }

    this.socketMessaging.sendEventToUser(character.channelId!, SkillSocketEvents.ReadInfo, { skill, buffs });

    if (!noMessage) {
      this.sendCharacterActivationDeactivationMessage(character, buff, type);
    }
  }

  @TrackNewRelicTransaction()
  public async calculateAllActiveBuffs(character: ICharacter): Promise<ICharacterBuff[] | undefined> {
    if (!character) {
      throw new Error("Character not found");
    }

    const characterBuffs = await this.characterBuffTracker.getAllCharacterBuffs(character._id);
    if (!characterBuffs) {
      return;
    }

    const buffMap = new Map<string, ICharacterBuff>();

    for (const buff of characterBuffs) {
      if (!buff) continue;

      const { trait, buffPercentage = 0, absoluteChange = 0 } = buff;

      if (buffMap.has(trait)) {
        const existingBuff = buffMap.get(trait)!;
        existingBuff.buffPercentage += buffPercentage;
        existingBuff.absoluteChange! += absoluteChange;
      } else {
        const { _id, options, ...cleanBuff } = buff;
        buffMap.set(trait, cleanBuff);
      }
    }

    return Array.from(buffMap.values());
  }

  private sendCharacterActivationDeactivationMessage(
    character: ICharacter,
    buff: ICharacterBuff,
    type: "activation" | "deactivation"
  ): void {
    if (buff.options?.messages?.skipAllMessages === true) {
      return;
    }

    const traitName = this.textFormatter.convertCamelCaseToSentence(buff.trait);
    const message =
      type === "activation"
        ? buff.options?.messages?.activation || `Your skill ${traitName} has been buffed by ${buff.buffPercentage}%!`
        : buff.options?.messages?.deactivation ||
          `Your skill ${traitName} has been debuffed by -${buff.buffPercentage}%!`;

    this.socketMessaging.sendMessageToCharacter(character, message);
  }
}
