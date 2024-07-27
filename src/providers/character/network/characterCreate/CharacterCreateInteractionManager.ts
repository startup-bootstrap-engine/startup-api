import { Character, ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { MapControlTimeModel } from "@entities/ModuleSystem/MapControlTimeModel";
import { TrackNewRelicTransaction } from "@providers/analytics/decorator/TrackNewRelicTransaction";
import { CharacterPremiumAccount } from "@providers/character/CharacterPremiumAccount";
import { CharacterView } from "@providers/character/CharacterView";
import { CharacterBuffTracker } from "@providers/character/characterBuff/CharacterBuffTracker";
import { CharacterBaseSpeed } from "@providers/character/characterMovement/CharacterBaseSpeed";
import { MovementSpeed } from "@providers/constants/MovementConstants";
import { ItemView } from "@providers/item/ItemView";
import { NPCManager } from "@providers/npc/NPCManager";
import { NPCWarn } from "@providers/npc/NPCWarn";
import { SocketMessaging } from "@providers/sockets/SocketMessaging";
import { Stealth } from "@providers/spells/data/logic/rogue/Stealth";
import {
  AnimationDirection,
  AvailableWeather,
  CharacterSkullType,
  CharacterSocketEvents,
  ICharacterCreateFromClient,
  ICharacterCreateFromServer,
  IControlTime,
  PeriodOfDay,
  UserAccountTypes,
  WeatherSocketEvents,
} from "@rpg-engine/shared";
import { provide } from "inversify-binding-decorators";

@provide(CharacterCreateInteractionManager)
export class CharacterCreateInteractionManager {
  constructor(
    private playerView: CharacterView,
    private itemView: ItemView,
    private npcManager: NPCManager,
    private npcWarn: NPCWarn,
    private stealth: Stealth,
    private characterPremiumAccount: CharacterPremiumAccount,
    private socketMessaging: SocketMessaging,
    private characterBuffTracker: CharacterBuffTracker,
    private characterBaseSpeed: CharacterBaseSpeed
  ) {}

  public async prepareDataForServer(
    character: ICharacter,
    clientData: ICharacterCreateFromClient
  ): Promise<ICharacterCreateFromServer> {
    const updatedSpeed = (await this.recalculateSpeed(character)).speed;
    const accountType = await this.characterPremiumAccount.getPremiumAccountType(character);

    return {
      ...clientData,
      id: character._id.toString(),
      name: character.name,
      x: character.x!,
      y: character.y!,
      direction: character.direction as AnimationDirection,
      layer: character.layer,
      speed: updatedSpeed,
      movementIntervalMs: character.movementIntervalMs,
      health: character.health,
      maxHealth: character.maxHealth,
      mana: character.mana,
      maxMana: character.maxMana,
      textureKey: character.textureKey,
      alpha: await this.stealth.getOpacity(character),
      isGiantForm: character.isGiantForm,
      hasSkull: character.hasSkull,
      skullType: character.skullType as CharacterSkullType,
      owner: { accountType: accountType ?? UserAccountTypes.Free },
    };
  }

  public async startNPCInteractions(character: ICharacter): Promise<void> {
    await this.npcManager.startNearbyNPCsBehaviorLoop(character);
    void this.npcWarn.warnCharacterAboutNPCsInView(character, { always: true });
    void this.itemView.warnCharacterAboutItemsInView(character, { always: true }); // Don't await to avoid blocking
  }

  public async sendCharacterCreateMessages(
    character: ICharacter,
    dataFromServer: ICharacterCreateFromServer
  ): Promise<void> {
    this.sendCreatedMessageToCharacterCreator(character.channelId!, dataFromServer);
    await this.sendCreationMessageToCharacters(character.channelId!, dataFromServer, character);
  }

  public async warnAboutWeatherStatus(channelId: string): Promise<void> {
    // how we keep only one record in registry, we have just one do find.
    // eslint-disable-next-line mongoose-lean/require-lean
    const lastTimeWeatherChanged = await MapControlTimeModel.findOne();
    if (lastTimeWeatherChanged) {
      const dataOfWeather: IControlTime = {
        time: lastTimeWeatherChanged.time,
        period: lastTimeWeatherChanged.period as PeriodOfDay,
        weather: lastTimeWeatherChanged.weather as AvailableWeather,
      };

      this.socketMessaging.sendEventToUser<IControlTime>(
        channelId!,
        WeatherSocketEvents.TimeWeatherControl,
        dataOfWeather
      );
    }
  }

  private async recalculateSpeed(character: ICharacter): Promise<{ speed: number }> {
    //! temporary ugly hack until we figure out why the hell sometimes the speed bugs out of nowhere

    await this.characterBuffTracker.clearCache(character._id, "speed");

    const baseSpeed = await this.characterBaseSpeed.getBaseSpeed(character);

    await Character.updateOne(
      {
        _id: character._id,
      },
      {
        baseSpeed,
      }
    );

    return { speed: baseSpeed ?? MovementSpeed.Standard };
  }

  private sendCreatedMessageToCharacterCreator(channelId: string, dataFromServer: ICharacterCreateFromServer): void {
    this.socketMessaging.sendEventToUser<ICharacterCreateFromServer>(
      channelId,
      CharacterSocketEvents.CharacterCreate,
      dataFromServer
    );
  }

  @TrackNewRelicTransaction()
  public async sendCreationMessageToCharacters(
    emitterChannelId: string,
    dataFromServer: ICharacterCreateFromServer,
    character: ICharacter
  ): Promise<void> {
    const nearbyCharacters = await this.playerView.getCharactersInView(character);

    if (nearbyCharacters.length > 0) {
      for (const nearbyCharacter of nearbyCharacters) {
        // tell other character that we exist, so it can create a new instance of us
        this.socketMessaging.sendEventToUser<ICharacterCreateFromServer>(
          nearbyCharacter.channelId!,
          CharacterSocketEvents.CharacterCreate,
          dataFromServer
        );

        const accountType = await this.characterPremiumAccount.getPremiumAccountType(nearbyCharacter);

        const nearbyCharacterPayload = {
          id: nearbyCharacter.id.toString(),
          name: nearbyCharacter.name,
          x: nearbyCharacter.x,
          y: nearbyCharacter.y,
          channelId: nearbyCharacter.channelId!,
          direction: nearbyCharacter.direction as AnimationDirection,
          isMoving: false,
          layer: nearbyCharacter.layer,
          speed: nearbyCharacter.speed,
          movementIntervalMs: nearbyCharacter.movementIntervalMs,
          health: nearbyCharacter.health,
          maxHealth: nearbyCharacter.maxHealth,
          mana: nearbyCharacter.mana,
          maxMana: nearbyCharacter.maxMana,
          textureKey: nearbyCharacter.textureKey,
          alpha: await this.stealth.getOpacity(nearbyCharacter),
          hasSkull: nearbyCharacter.hasSkull,
          skullType: nearbyCharacter.skullType as CharacterSkullType,
          owner: {
            accountType: accountType ?? UserAccountTypes.Free,
          },
        };

        // tell the emitter about these other characters too

        this.socketMessaging.sendEventToUser<ICharacterCreateFromServer>(
          emitterChannelId,
          CharacterSocketEvents.CharacterCreate,
          nearbyCharacterPayload
        );
      }
    }
  }
}
