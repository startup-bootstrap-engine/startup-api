import { Character, ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { SocketMessaging } from "@providers/sockets/SocketMessaging";
import { TextFormatter } from "@providers/text/TextFormatter";
import { CharacterSocketEvents, ICharacterBuff } from "@rpg-engine/shared";
import { provide } from "inversify-binding-decorators";

import { TrackNewRelicTransaction } from "@providers/analytics/decorator/TrackNewRelicTransaction";
import { CharacterBuffTracker } from "./CharacterBuffTracker";

export interface IBuffValueCalculations {
  baseTraitValue: number;
  buffAbsoluteChange: number;
  updatedTraitValue: number;
}

@provide(CharacterBuffAttribute)
export class CharacterBuffAttribute {
  constructor(
    private characterBuffTracker: CharacterBuffTracker,
    private socketMessaging: SocketMessaging,
    private textFormatter: TextFormatter
  ) {}

  @TrackNewRelicTransaction()
  public async enableBuff(character: ICharacter, buff: ICharacterBuff, noMessage?: boolean): Promise<ICharacterBuff> {
    const { buffAbsoluteChange, updatedTraitValue } = await this.performBuffValueCalculations(character._id, buff);

    // Save the absolute change in the buff object
    buff.absoluteChange = Number(buffAbsoluteChange.toFixed(2));

    // then register the buff on redis (so we can rollback when needed)

    const addedBuff = await this.characterBuffTracker.addBuff(character._id, buff);

    const updatedTraitValueFixed = Number(updatedTraitValue.toFixed(2));

    if (!addedBuff) {
      throw new Error("Could not add buff to character");
    }

    // finally, update on the model
    await Character.updateOne(
      { _id: character._id },
      {
        [buff.trait]: updatedTraitValueFixed,
      }
    );

    // inform and send update to client
    this.sendUpdateToClient(character, buff, updatedTraitValueFixed, noMessage);

    return addedBuff;
  }

  @TrackNewRelicTransaction()
  public async disableBuff(character: ICharacter, buffId: string, noMessage?: boolean): Promise<boolean> {
    const updatedCharacter = await Character.findById(character._id).lean();

    if (!updatedCharacter) {
      throw new Error("Character not found");
    }

    character = updatedCharacter as ICharacter;

    // rollback model changes
    const buff = await this.characterBuffTracker.getBuff(character._id, buffId);

    if (!buff) {
      return false;
    }

    const currentBuffValue = character[buff.trait];

    const debuffValue = buff.absoluteChange!;

    const updatedTraitValue = Number((currentBuffValue - debuffValue).toFixed(2));

    // then delete the buff from redis

    const hasDeletedBuff = await this.characterBuffTracker.deleteBuff(character, buff._id!, buff.trait!);

    if (!hasDeletedBuff) {
      throw new Error(`Could not delete buff from character ${character._id} - ${buff._id}`);
    }

    await Character.updateOne(
      { _id: character._id },
      {
        [buff.trait]: updatedTraitValue,
      }
    );

    try {
      const newCharacter = await Character.findById(character._id).lean();

      // Use destructuring to reduce the repetitive newCharacter
      const { health, maxHealth, mana, maxMana } = newCharacter || {};

      // Guard clause to avoid nested if statements and extra conditions
      if (health && maxHealth && health > maxHealth) {
        await this.updateCharacterAndSendEvent(character, "health", maxHealth);
      }

      if (mana && maxMana && mana > maxMana) {
        await this.updateCharacterAndSendEvent(character, "mana", maxMana);
      }
    } catch (err) {
      console.error(err);
      throw err;
    }

    if (!noMessage) {
      if (!buff.options?.messages?.skipAllMessages && !buff.options?.messages?.skipDeactivationMessage) {
        this.socketMessaging.sendMessageToCharacter(
          character,
          buff.options?.messages?.deactivation ||
            `Your ${this.textFormatter.convertCamelCaseToSentence(buff.trait)} buff was removed!`
        );
      }
    }

    // inform and send update to client
    this.sendUpdateToClient(character, buff, updatedTraitValue, noMessage);

    return true;
  }

  private async updateCharacterAndSendEvent(
    character: ICharacter,
    attribute: "health" | "mana",
    newValue: number
  ): Promise<void> {
    await Character.updateOne({ _id: character._id }, { [attribute]: newValue });
    this.socketMessaging.sendEventToUser(character.channelId!, CharacterSocketEvents.AttributeChanged, {
      targetId: character._id,
      [attribute]: newValue,
    });
  }

  @TrackNewRelicTransaction()
  private async performBuffValueCalculations(
    characterId: string,
    buff: ICharacterBuff
  ): Promise<IBuffValueCalculations> {
    const totalTraitSummedBuffs = await this.characterBuffTracker.getAllBuffPercentageChanges(characterId, buff.trait);

    const updatedCharacter = (await Character.findById(characterId).lean()) as ICharacter;

    if (!updatedCharacter) {
      throw new Error("Character not found");
    }

    const baseTraitValue = Number((updatedCharacter[buff.trait] / (1 + totalTraitSummedBuffs / 100)).toFixed(2));

    // Calculates if there is already a buff, then takes it with the current buff
    const totalBuffPercentage = totalTraitSummedBuffs + buff.buffPercentage;

    // Calculate the total applied buff
    const buffTrait = Number((baseTraitValue * (1 + buff.buffPercentage / 100)).toFixed(2));

    const updatedTraitValue = Number((baseTraitValue * (1 + totalBuffPercentage / 100)).toFixed(2));

    // Calculate the absolute change of the new buff
    const buffAbsoluteChange = Number((buffTrait - baseTraitValue).toFixed(2));

    return {
      baseTraitValue,
      buffAbsoluteChange,
      updatedTraitValue,
    };
  }

  private sendUpdateToClient(
    character: ICharacter,
    buff: ICharacterBuff,
    updatedTraitValue: number,
    noMessage?: boolean
  ): void {
    const clientTraitNames = {
      baseSpeed: "speed",
      maxHealth: "maxHealth",
      maxMana: "maxMana",
    };

    this.socketMessaging.sendEventToUser(character.channelId!, CharacterSocketEvents.AttributeChanged, {
      targetId: character._id,
      [clientTraitNames[buff.trait]]: updatedTraitValue,
    });

    if (!noMessage) {
      if (!buff.options?.messages?.skipAllMessages && !buff.options?.messages?.skipActivationMessage) {
        this.socketMessaging.sendMessageToCharacter(
          character,
          buff.options?.messages?.activation ||
            `Your ${this.textFormatter.convertCamelCaseToSentence(buff.trait)} has been buffed by ${
              buff.buffPercentage
            }%!`
        );
      }
    }
  }
}
