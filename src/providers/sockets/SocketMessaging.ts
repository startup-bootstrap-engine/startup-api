import { Character, ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { INPC } from "@entities/ModuleNPC/NPCModel";
import { TrackNewRelicTransaction } from "@providers/analytics/decorator/TrackNewRelicTransaction";
import { CharacterView } from "@providers/character/CharacterView";
import { appEnv } from "@providers/config/env";
import { NPCView } from "@providers/npc/NPCView";
import { RedisStreamChannels, RedisStreams } from "@providers/redis/RedisStreams";
import { SocketAdapter } from "@providers/sockets/SocketAdapter";
import {
  CharacterSkullType,
  CharacterSocketEvents,
  EnvType,
  ICharacterAttributeChanged,
  IUIShowMessage,
  UIMessageType,
  UISocketEvents,
} from "@rpg-engine/shared";
import { provide } from "inversify-binding-decorators";
import { Types } from "mongoose";

@provide(SocketMessaging)
export class SocketMessaging {
  constructor(
    private characterView: CharacterView,
    private npcView: NPCView,
    private socketAdapter: SocketAdapter,
    private redisStreams: RedisStreams
  ) {}

  public addSendEventToUserListener(): void {
    // eslint-disable-next-line require-await
    void this.redisStreams.readFromStream(RedisStreamChannels.SocketEvents, async (message) => {
      const { userChannel, eventName, data: eventData } = message;
      this.sendEventToUser(userChannel, eventName, eventData);
    });
  }

  public sendErrorMessageToCharacter(character: ICharacter, message?: string, type: UIMessageType = "error"): void {
    if ((appEnv.general.ENV === EnvType.Development && !appEnv.general.IS_UNIT_TEST) || appEnv.general.DEBUG_MODE) {
      console.log(`✉︎ Error sent to ${character.name}: ${message}`);
    }

    this.sendEventToUser<IUIShowMessage>(character.channelId!, UISocketEvents.ShowMessage, {
      message: message ?? "Sorry, not possible.",
      type,
    });
  }

  public sendMessageToCharacter(character: ICharacter, message: string): void {
    this.sendEventToUser<IUIShowMessage>(character.channelId!, UISocketEvents.ShowMessage, {
      message: message,
      type: "info",
    });
  }

  public sendEventToUser<T>(userChannel: string, eventName: string, data?: T): void {
    if (appEnv.general.MICROSERVICE_NAME === "rpg-npc") {
      // Add to stream to be processed by the rpg-socket service
      void this.redisStreams.addToStream(RedisStreamChannels.SocketEvents, {
        userChannel,
        eventName,
        data: data || {},
      });
    } else {
      // We're in the rpg-socket service; emit directly to the user
      void this.socketAdapter.emitToUser(userChannel, eventName, data || {});
    }
  }

  //! Careful with the method! This sends an event to ALL USERS ON THE SERVER!
  public sendEventToAllUsers<T>(eventName: string, data?: T): void {
    this.socketAdapter.emitToAllUsers(eventName, data || {});
  }

  @TrackNewRelicTransaction()
  public async sendEventToCharactersAroundCharacter<T>(
    character: ICharacter,
    eventName: string,
    data?: T,
    includeSelf: boolean = false
  ): Promise<void> {
    const charactersNearby = await this.characterView.getCharactersInView(character);

    if (charactersNearby) {
      for (const nearbyCharacter of charactersNearby) {
        this.sendEventToUser<T>(nearbyCharacter.channelId!, eventName, data || ({} as T));
      }
    }

    if (includeSelf) {
      this.sendEventToUser<T>(character.channelId!, eventName, data || ({} as T));
    }
  }

  @TrackNewRelicTransaction()
  public async sendEventToCharactersAroundNPC<T>(npc: INPC, eventName: string, data?: T): Promise<void> {
    const charactersNearby = await this.npcView.getCharactersInView(npc);

    if (charactersNearby) {
      for (const character of charactersNearby) {
        this.sendEventToUser<T>(character.channelId!, eventName, data || ({} as T));
      }
    }
  }

  @TrackNewRelicTransaction()
  public async sendEventAttributeChange(characterId: Types.ObjectId): Promise<void> {
    const character = (await Character.findById(characterId).lean()) as ICharacter;

    const payload: ICharacterAttributeChanged = {
      targetId: character._id,
      health: character.health,
      maxHealth: character.maxHealth,
      mana: character.mana,
      maxMana: character.maxMana,
      speed: character.speed,
      weight: character.weight,
      maxWeight: character.maxWeight,
      alpha: character.alpha,
      attackIntervalSpeed: character.attackIntervalSpeed,
      textureKey: character.textureKey,
      isGiantForm: character.isGiantForm,
      hasSkull: character.hasSkull,
      skullType: character.skullType as CharacterSkullType,
    };

    this.sendEventToUser(character.channelId!, CharacterSocketEvents.AttributeChanged, payload);

    await this.sendEventToCharactersAroundCharacter(character, CharacterSocketEvents.AttributeChanged, payload);
  }

  public sendEventToMultipleCharacters<T>(characters: ICharacter[], eventName: string, data?: any): void {
    for (const character of characters) {
      this.sendEventToUser<T>(character.channelId!, eventName, data);
    }
  }
}
