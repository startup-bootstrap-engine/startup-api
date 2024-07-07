import { Character, ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { TrackNewRelicTransaction } from "@providers/analytics/decorator/TrackNewRelicTransaction";
import { CharacterBan } from "@providers/character/CharacterBan";
import { CharacterValidation } from "@providers/character/CharacterValidation";
import { SocketMessaging } from "@providers/sockets/SocketMessaging";
import { MacroSocketEvents } from "@rpg-engine/shared";
import { provide } from "inversify-binding-decorators";

@provide(MacroCaptchaVerify)
export class MacroCaptchaVerify {
  constructor(
    private socketMessaging: SocketMessaging,
    private characterValidation: CharacterValidation,
    private characterBan: CharacterBan
  ) {}

  @TrackNewRelicTransaction()
  public async startCaptchaVerification(character: ICharacter, code: string): Promise<boolean> {
    if (!this.characterValidation.hasBasicValidation(character)) {
      this.socketMessaging.sendErrorMessageToCharacter(character);
      return false;
    }

    return await this.verifyUserCaptcha(character, code);
  }

  private async verifyUserCaptcha(character: ICharacter, code: string): Promise<boolean> {
    // eslint-disable-next-line mongoose-lean/require-lean
    const fetchedCharacter = await Character.findById(character._id).select("+captchaVerifyCode");

    if (!fetchedCharacter?.captchaVerifyCode) {
      this.socketMessaging.sendErrorMessageToCharacter(character, "Sorry, you don't have any captcha to verify!");
      return false;
    }

    if (code.toLowerCase() === fetchedCharacter?.captchaVerifyCode.toLowerCase()) {
      await this.handleSuccessVerify(fetchedCharacter);
    } else if (fetchedCharacter?.captchaTriesLeft === 1) await this.handleVerifyBan(fetchedCharacter);
    else if (fetchedCharacter?.captchaTriesLeft) await this.handleDecreaseCaptchaTries(fetchedCharacter);

    return true;
  }

  private async handleSuccessVerify(character: ICharacter): Promise<void> {
    await this.removeCaptchaFromCharacter(character);
    this.socketMessaging.sendEventToUser(character.channelId!, MacroSocketEvents.MacroVerifySuccess);
  }

  private async handleVerifyBan(character: ICharacter): Promise<void> {
    await this.removeCaptchaFromCharacter(character);
    await this.characterBan.banAntiMacroCharacters(character, 1);
  }

  private async handleDecreaseCaptchaTries(character: ICharacter): Promise<void> {
    if (!character.captchaTriesLeft) return;

    await Character.findByIdAndUpdate(character._id, {
      captchaTriesLeft: character.captchaTriesLeft - 1,
    });
    this.socketMessaging.sendEventToUser(character.channelId!, MacroSocketEvents.MacroVerifyFailed, {
      triesLeft: character.captchaTriesLeft - 1,
    });
  }

  private async removeCaptchaFromCharacter(character: ICharacter): Promise<void> {
    const captchaNoVerifyUntil = new Date();
    captchaNoVerifyUntil.setHours(captchaNoVerifyUntil.getHours() + 1);

    await Character.findByIdAndUpdate(character._id, {
      captchaTriesLeft: undefined,
      captchaVerifyCode: undefined,
      captchaVerifyDate: undefined,
      captchaNoVerifyUntil,
    });
  }
}
