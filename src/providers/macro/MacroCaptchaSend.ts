import { Character, ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { CharacterValidation } from "@providers/character/CharacterValidation";
import { SocketMessaging } from "@providers/sockets/SocketMessaging";
import { MacroSocketEvents } from "@rpg-engine/shared";
import { provide } from "inversify-binding-decorators";
import svgCaptcha from "svg-captcha";

@provide(MacroCaptchaSend)
export class MacroCaptchaSend {
  constructor(private socketMessaging: SocketMessaging, private characterValidation: CharacterValidation) {}

  public async sendAndStartCaptchaVerification(character: ICharacter) {
    if (!this.characterValidation.hasBasicValidation(character)) {
      this.socketMessaging.sendErrorMessageToCharacter(character);
      return false;
    }

    if (await this.checkIfUserHasAlreadyVerification(character)) {
      return false;
    }

    return await this.generateAndSendCaptcha(character);
  }

  private async checkIfUserHasAlreadyVerification(character: ICharacter) {
    const fetchedCharacter = await Character.findById(character._id).select("+captchaVerifyCode").lean();

    if (fetchedCharacter?.captchaVerifyCode) {
      this.socketMessaging.sendErrorMessageToCharacter(character, "Fill out the present captcha!");
      return true;
    }

    return false;
  }

  public async generateAndSendCaptcha(character: ICharacter) {
    const captcha = svgCaptcha.create({
      size: 6,
      noise: 3,
      color: true,
      ignoreChars: "ABCDEFGHIJKLMNOPQRSTUVWXYZ0Oo1il",
    });

    const resolveUntil = new Date(Date.now() + 15 * 60 * 1000);

    await Character.findByIdAndUpdate(character._id, {
      captchaVerifyCode: captcha.text,
      captchaVerifyDate: resolveUntil,
      captchaTriesLeft: 5,
    }).lean();

    this.socketMessaging.sendEventToUser(character.channelId!, MacroSocketEvents.OpenMacroModal, {
      svgData: captcha.data,
      triesLeft: 5,
      resolveUntil,
    });

    return true;
  }
}