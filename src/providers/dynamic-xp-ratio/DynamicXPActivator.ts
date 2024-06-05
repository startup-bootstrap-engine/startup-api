import { Character } from "@entities/ModuleCharacter/CharacterModel";
import {
  DYNAMIC_XP_RATIO_BASE_RATIO,
  DYNAMIC_XP_RATIO_BOOSTED_XP_RATIO,
} from "@providers/constants/DynamicXpRatioConstants";
import { DiscordBot } from "@providers/discord/DiscordBot";
import { SocketMessaging } from "@providers/sockets/SocketMessaging";
import { IUIShowMessage, UISocketEvents } from "@rpg-engine/shared";
import dayjs from "dayjs";
import { provide } from "inversify-binding-decorators";
import { DynamicXPRatio } from "./DynamicXPRatio";

@provide(DynamicXPActivator)
export class DynamicXPActivator {
  private readonly activationHour = 5; // 5 AM

  constructor(
    private discordBot: DiscordBot,
    private socketMessaging: SocketMessaging,
    private dynamicXPRatio: DynamicXPRatio
  ) {}

  public async toggleXpRatio(): Promise<void> {
    const today = dayjs();
    const isActivationDay = today.day() === 6; // Check if today is Saturday
    const isDeactivationDay = today.day() === 1; // Check if today is Monday
    const currentHour = today.hour();

    if (isActivationDay && currentHour >= this.activationHour) {
      await this.toggleXPRatio(
        DYNAMIC_XP_RATIO_BOOSTED_XP_RATIO,
        "✨ Bonus XP Event ✨\n\n🎉 Enjoy double XP this Saturday! 🎉",
        "✨ Bonus XP Event Started!✨\n\n🔹 XP Multiplier: 2x"
      );
    } else if (isDeactivationDay && currentHour >= this.activationHour) {
      await this.toggleXPRatio(
        DYNAMIC_XP_RATIO_BASE_RATIO,
        "✨ Bonus XP Event ✨\n\n🎉 Bonus XP Saturday has ended. 🎉",
        "✨ Bonus XP Event Ended!✨\n\n🔹 XP Multiplier: 1x"
      );
    }
  }

  private async toggleXPRatio(newRatio: number, discordMessage: string, playerMessage: string): Promise<void> {
    const currentRatio = await this.dynamicXPRatio.getXpRatio();
    if (currentRatio !== newRatio) {
      await this.dynamicXPRatio.updateXpRatio(newRatio);

      try {
        await this.discordBot.sendMessageWithColor(
          discordMessage,
          "announcements",
          "Double XP Weekend!",
          "Green",
          "https://i.imgur.com/I48LmP3.png"
        );

        // Send server message to each online player
        const allOnlineCharacters = await Character.find({ isOnline: true }).lean();
        for (const character of allOnlineCharacters) {
          this.socketMessaging.sendEventToUser<IUIShowMessage>(character.channelId!, UISocketEvents.ShowMessage, {
            message: playerMessage,
            type: "info",
          });
        }
      } catch (error) {
        console.error("Failed to send bonus XP message: ", error);
      }
    }
  }
}
