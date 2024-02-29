import { Character, ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { TrackNewRelicTransaction } from "@providers/analytics/decorator/TrackNewRelicTransaction";
import { characterBuffActivator } from "@providers/inversify/container";
import { SocketMessaging } from "@providers/sockets/SocketMessaging";
import {
  BasicAttribute,
  CharacterBuffDurationType,
  CharacterBuffType,
  CharacterSocketEvents,
  ICharacterAttributeChanged,
  ShadowWalkerRaces,
  SpellsBlueprint,
} from "@rpg-engine/shared";
import { provide } from "inversify-binding-decorators";

@provide(BullStrength)
export class BullStrength {
  constructor(private socketMessaging: SocketMessaging) {}

  @TrackNewRelicTransaction()
  public async handleBullStrength(character: ICharacter, buffPercentage: number, timeout: number): Promise<void> {
    try {
      if (!character || character.race !== ShadowWalkerRaces.Minotaur) {
        return;
      }
      await Promise.all([
        characterBuffActivator.enableTemporaryBuff(character, {
          type: CharacterBuffType.Skill,
          trait: BasicAttribute.Strength,
          buffPercentage,
          durationSeconds: timeout,
          durationType: CharacterBuffDurationType.Temporary,
          isStackable: false,
          originateFrom: SpellsBlueprint.MinotaurBullStrength,
        }),
        this.enableGiantForm(character, timeout),
      ]);
    } catch (error) {
      console.error(`Failed to handle set character to giant form: ${error}`);
    }
  }

  private async enableGiantForm(character: ICharacter, timeout: number): Promise<void> {
    await Character.updateOne({ _id: character._id }, { $set: { isGiantForm: true } });

    const payload: ICharacterAttributeChanged = {
      targetId: character._id,
      isGiantForm: true,
    };

    await this.socketMessaging.sendEventToCharactersAroundCharacter(
      character,
      CharacterSocketEvents.AttributeChanged,
      payload,
      true
    );

    setTimeout(() => {
      this.socketMessaging.sendMessageToCharacter(character, "You have become a giant! Let's crush some skulls 💀!");
    }, 2000);

    setTimeout(async () => {
      await this.disableGiantForm(character);
    }, timeout * 1000);
  }

  private async disableGiantForm(character: ICharacter): Promise<void> {
    await Character.updateOne({ _id: character._id }, { $set: { isGiantForm: false } });

    const payload: ICharacterAttributeChanged = {
      targetId: character._id,
      isGiantForm: false,
    };

    await this.socketMessaging.sendEventToCharactersAroundCharacter(
      character,
      CharacterSocketEvents.AttributeChanged,
      payload,
      true
    );

    setTimeout(() => {
      this.socketMessaging.sendMessageToCharacter(character, "You turn back to normal!");
    }, 2000);
  }
}
