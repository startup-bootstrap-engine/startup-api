import { Character, ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { container, unitTestHelper } from "@providers/inversify/container";
import svgCaptcha from "svg-captcha";
import { MacroCaptchaSend } from "../MacroCaptchaSend";

describe("MacroCaptchaSend.ts", () => {
  let testCharacter: ICharacter;
  let macroCaptchaSend: MacroCaptchaSend;
  let sendEventToUser: any;
  let sendErrorMessageToCharacter: any;

  beforeAll(() => {
    macroCaptchaSend = container.get<MacroCaptchaSend>(MacroCaptchaSend);
  });

  beforeEach(async () => {
    testCharacter = await unitTestHelper.createMockCharacter(null, {
      hasEquipment: true,
      hasInventory: true,
      hasSkills: true,
    });

    // @ts-ignore
    sendEventToUser = jest.spyOn(macroCaptchaSend.socketMessaging, "sendEventToUser" as any);
    // @ts-ignore
    sendErrorMessageToCharacter = jest.spyOn(macroCaptchaSend.socketMessaging, "sendErrorMessageToCharacter" as any);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("Core features", () => {
    it("should generate new captcha and send it to the character", async () => {
      const isCaptchaGenerated = await macroCaptchaSend.sendAndStartCaptchaVerification(testCharacter);

      expect(isCaptchaGenerated).toBe(true);
      expect(sendEventToUser).toBeCalled();
    });

    it("should not generate new captcha if character has already a captcha ongoing", async () => {
      testCharacter.captchaVerifyCode = "abcdef";
      testCharacter.captchaTriesLeft = 5;
      await testCharacter.save();

      const isCaptchaGenerated = await macroCaptchaSend.sendAndStartCaptchaVerification(testCharacter);

      expect(isCaptchaGenerated).toBe(false);
      expect(sendErrorMessageToCharacter).toBeCalled();
    });
  });

  describe("Edge cases", () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    it("should update character data on successful captcha send", async () => {
      await macroCaptchaSend.sendAndStartCaptchaVerification(testCharacter);

      const updatedCharacter = await Character.findById(testCharacter._id).lean();
      expect(updatedCharacter?.captchaVerifyCode).not.toBeNull();
      expect(updatedCharacter?.captchaVerifyDate).not.toBeNull();
      expect(updatedCharacter?.captchaTriesLeft).toBe(10);
    });

    it("should not send captcha if basic validation fails", async () => {
      // @ts-ignore
      jest.spyOn(macroCaptchaSend.characterValidation, "hasBasicValidation").mockReturnValue(false);

      const isCaptchaGenerated = await macroCaptchaSend.sendAndStartCaptchaVerification(testCharacter);

      expect(isCaptchaGenerated).toBe(false);
      expect(sendErrorMessageToCharacter).toBeCalled();
    });

    it("should handle captcha generation failure", async () => {
      // @ts-ignore
      jest.spyOn(svgCaptcha, "create").mockImplementation(() => {
        throw new Error("Captcha generation failed");
      });

      expect(await macroCaptchaSend.sendAndStartCaptchaVerification(testCharacter)).toBe(false);
    });

    it("should not send captcha to offline characters", async () => {
      testCharacter.isOnline = false;
      await testCharacter.save();

      const isCaptchaGenerated = await macroCaptchaSend.sendAndStartCaptchaVerification(testCharacter);

      expect(isCaptchaGenerated).toBe(false);
    });

    it("should not send new captcha if no tries left", async () => {
      testCharacter.captchaTriesLeft = 0;
      await testCharacter.save();

      const isCaptchaGenerated = await macroCaptchaSend.sendAndStartCaptchaVerification(testCharacter);

      expect(isCaptchaGenerated).toBe(false);
    });
  });
});
