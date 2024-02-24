import { Character } from "@entities/ModuleCharacter/CharacterModel";
import { CharacterBan } from "@providers/character/CharacterBan";
import { ANTI_MACRO_PROBABILITY_TRIGGER } from "@providers/constants/AntiMacroConstants";
import { MacroCaptchaSend } from "@providers/macro/MacroCaptchaSend";
import { MacroCharacterBotDetector } from "@providers/macro/MacroCharacterBotDetector";
import { provide } from "inversify-binding-decorators";
import _ from "lodash";
import { CronJobScheduler } from "./CronJobScheduler";

@provide(MacroCaptchaCrons)
export class MacroCaptchaCrons {
  constructor(
    private characterBan: CharacterBan,
    private macroCaptchaSend: MacroCaptchaSend,
    private cronJobScheduler: CronJobScheduler,
    private macroCharacterBotDetector: MacroCharacterBotDetector
  ) {}

  public schedule(): void {
    //! Disabled because this shit only gives me headaches and turn off players.
    this.cronJobScheduler.uniqueSchedule("macro-captcha-cron-ban-macro-characters", "*/2 * * * *", async () => {
      await this.banMacroCharacters();
    });
    this.cronJobScheduler.uniqueSchedule(
      "macro-captcha-cron-send-macro-captcha-to-active-characters",
      "*/5 * * * *",
      async () => {
        await this.sendMacroCaptchaToActiveCharacters();
      }
    );
  }

  private async banMacroCharacters(): Promise<void> {
    const now = new Date();

    const charactersWithCaptchaNotVerified = await Character.find({
      captchaVerifyDate: {
        $lt: now,
      },
    });

    if (!charactersWithCaptchaNotVerified.length) return;

    await Character.updateMany(
      {
        captchaVerifyDate: {
          $lt: now,
        },
        isOnline: true,
      },
      {
        captchaVerifyCode: undefined,
        captchaVerifyDate: undefined,
        captchaTriesLeft: undefined,
      }
    ).lean();
    await Character.updateMany(
      {
        captchaVerifyDate: {
          $lt: now,
        },
        isOnline: false,
      },
      {
        captchaVerifyDate: undefined,
        captchaTriesLeft: undefined,
      }
    ).lean();

    await Promise.all(
      charactersWithCaptchaNotVerified.map(async (character) => {
        if (character.isOnline) await this.characterBan.banAntiMacroCharacters(character, 1);
      })
    );
  }

  private async sendMacroCaptchaToActiveCharacters(): Promise<void> {
    const now = new Date();
    now.setMinutes(now.getMinutes() - 1);

    const charactersWithCaptchaNotVerified = await Character.find({
      captchaVerifyCode: undefined,
      updatedAt: {
        $gt: now,
      },
      $or: [
        {
          captchaNoVerifyUntil: undefined,
        },
        {
          captchaNoVerifyUntil: {
            $lt: now,
          },
        },
      ],
      isOnline: true,
    });

    let sentTo = 0;

    await Promise.all(
      charactersWithCaptchaNotVerified.map(async (character) => {
        // Skip anti macro on training rooms
        if (character.scene.includes("training")) {
          return;
        }

        const isPotentialMacroOrBotUser = await this.macroCharacterBotDetector.isPotentialBotUser(character);

        console.log(`⚠️ Character ${character.name} is potential bot user: ${isPotentialMacroOrBotUser}`);

        if (isPotentialMacroOrBotUser) {
          const n = _.random(1, 100);

          if (n <= ANTI_MACRO_PROBABILITY_TRIGGER) {
            await this.macroCaptchaSend.sendAndStartCaptchaVerification(character);
            sentTo++;
          }
        }
      })
    );
  }
}
