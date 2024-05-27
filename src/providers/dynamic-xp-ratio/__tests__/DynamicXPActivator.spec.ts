import { Character } from "@entities/ModuleCharacter/CharacterModel";
import {
  DYNAMIC_XP_RATIO_BASE_RATIO,
  DYNAMIC_XP_RATIO_BOOSTED_XP_RATIO,
} from "@providers/constants/DynamicXpRatioConstants";
import { container } from "@providers/inversify/container";
import { UISocketEvents } from "@rpg-engine/shared";
import dayjs from "dayjs";
import { DynamicXPActivator } from "../DynamicXPActivator";
import { DynamicXPRatio } from "../DynamicXPRatio";

describe("DynamicXPActivator", () => {
  let dynamicXPActivator: DynamicXPActivator;
  let dynamicXPRatio: DynamicXPRatio;
  let discordBotSpy: jest.SpyInstance;
  let socketMessagingSpy: jest.SpyInstance;
  let getXpRatioSpy: jest.SpyInstance;
  let updateXpRatioSpy: jest.SpyInstance;
  let findCharactersSpy: jest.SpyInstance;

  beforeAll(() => {
    dynamicXPActivator = container.get(DynamicXPActivator);
    dynamicXPRatio = container.get(DynamicXPRatio);

    // @ts-ignore
    discordBotSpy = jest.spyOn(dynamicXPActivator.discordBot, "sendMessageWithColor").mockResolvedValue(undefined);
    // @ts-ignore
    socketMessagingSpy = jest.spyOn(dynamicXPActivator.socketMessaging, "sendEventToUser").mockResolvedValue(undefined);
    getXpRatioSpy = jest.spyOn(dynamicXPRatio, "getXpRatio").mockResolvedValue(DYNAMIC_XP_RATIO_BASE_RATIO);
    updateXpRatioSpy = jest.spyOn(dynamicXPRatio, "updateXpRatio").mockResolvedValue(undefined);
    // Mock the Character.find method to return an object with a lean method
    findCharactersSpy = jest.spyOn(Character, "find").mockReturnValue({
      lean: jest.fn().mockResolvedValue([{ channelId: "channel1" }]),
    } as any);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should properly activate the XP bonus on the proper day", async () => {
    jest.spyOn(dayjs.prototype, "day").mockReturnValue(6); // Saturday
    jest.spyOn(dayjs.prototype, "hour").mockReturnValue(5);
    getXpRatioSpy.mockResolvedValue(DYNAMIC_XP_RATIO_BASE_RATIO);

    await dynamicXPActivator.toggleXpRatio();

    expect(updateXpRatioSpy).toHaveBeenCalledWith(DYNAMIC_XP_RATIO_BOOSTED_XP_RATIO);
    expect(discordBotSpy).toHaveBeenCalledWith(
      "✨ Bonus XP Event ✨\n\n🎉 Enjoy double XP this Saturday! 🎉",
      "announcements",
      "Double XP Weekend!",
      "Green",
      "https://i.imgur.com/I48LmP3.png"
    );
    expect(socketMessagingSpy).toHaveBeenCalledWith("channel1", UISocketEvents.ShowMessage, {
      message: "✨ Bonus XP Event Started!✨\n\n🔹 XP Multiplier: 2x",
      type: "info",
    });
  });

  it("should properly deactivate the XP bonus on the proper day", async () => {
    jest.spyOn(dayjs.prototype, "day").mockReturnValue(1); // Monday
    jest.spyOn(dayjs.prototype, "hour").mockReturnValue(5);
    getXpRatioSpy.mockResolvedValue(DYNAMIC_XP_RATIO_BOOSTED_XP_RATIO);

    await dynamicXPActivator.toggleXpRatio();

    expect(updateXpRatioSpy).toHaveBeenCalledWith(DYNAMIC_XP_RATIO_BASE_RATIO);
    expect(discordBotSpy).toHaveBeenCalledWith(
      "✨ Bonus XP Event ✨\n\n🎉 Bonus XP Saturday has ended. 🎉",
      "announcements",
      "Double XP Weekend!",
      "Green",
      "https://i.imgur.com/I48LmP3.png"
    );
    expect(socketMessagingSpy).toHaveBeenCalledWith("channel1", UISocketEvents.ShowMessage, {
      message: "✨ Bonus XP Event Ended!✨\n\n🔹 XP Multiplier: 1x",
      type: "info",
    });
  });

  it("should not send messages if XP ratio does not change", async () => {
    jest.spyOn(dayjs.prototype, "day").mockReturnValue(6); // Saturday
    jest.spyOn(dayjs.prototype, "hour").mockReturnValue(5);
    getXpRatioSpy.mockResolvedValue(DYNAMIC_XP_RATIO_BOOSTED_XP_RATIO);
    const updateXpRatioSpy = jest.spyOn(dynamicXPRatio, "updateXpRatio").mockResolvedValue(undefined);
    const sendMessageSpy = jest
      // @ts-ignore
      .spyOn(dynamicXPActivator.discordBot, "sendMessageWithColor")
      .mockResolvedValue(undefined);
    const sendEventToUserSpy = jest
      // @ts-ignore
      .spyOn(dynamicXPActivator.socketMessaging, "sendEventToUser")
      // @ts-ignore
      .mockResolvedValue(undefined);

    await dynamicXPActivator.toggleXpRatio();

    expect(updateXpRatioSpy).not.toHaveBeenCalled();
    expect(sendMessageSpy).not.toHaveBeenCalled();
    expect(sendEventToUserSpy).not.toHaveBeenCalled();
  });
});
