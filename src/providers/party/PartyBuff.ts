import { CharacterBuff } from "@entities/ModuleCharacter/CharacterBuffModel";
import { Character, ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { CharacterParty, ICharacterParty } from "@entities/ModuleCharacter/CharacterPartyModel";
import { CharacterBuffActivator } from "@providers/character/characterBuff/CharacterBuffActivator";
import {
  BasicAttribute,
  CharacterAttributes,
  CharacterBuffDurationType,
  CharacterBuffType,
  CharacterClass,
  CharacterPartyBenefits,
  CombatSkill,
  CraftingSkill,
  ICharacterBuff,
  ICharacterPermanentBuff,
} from "@rpg-engine/shared";
import { provide } from "inversify-binding-decorators";
import _ from "lodash";
import { PartyBenefitsCalculator } from "./PartyBenefitsCalculator";
import { PartyMembers } from "./PartyMembers";

type BuffSkillTypes = BasicAttribute | CombatSkill | CraftingSkill | CharacterAttributes;

@provide(PartyBuff)
export class PartyBuff {
  constructor(
    private characterBuffActivator: CharacterBuffActivator,
    private partyBenefitsCalculator: PartyBenefitsCalculator,
    private partyMembers: PartyMembers
  ) {}

  // CHARACTERS BUFFS
  public async handleAllBuffInParty(teste: ICharacterParty, isAdding: boolean): Promise<void> {
    const party = (await CharacterParty.findById(teste._id)
      .lean()
      .select("_id leader members size")) as ICharacterParty;

    const differentClasses = this.partyMembers.getDifferentClasses(party);
    const { leader, members, size } = party;

    const numberOfMembers = size || members.length + 1;
    const benefits = this.partyBenefitsCalculator.calculatePartyBenefits(numberOfMembers, differentClasses);

    const skillBenefit = benefits.find((benefit) => benefit.benefit === CharacterPartyBenefits.Skill);

    if (!skillBenefit) {
      return;
    }

    try {
      await this.handleCharacterBuffSkill(leader._id.toString(), skillBenefit.value, isAdding);
      for (const member of members) {
        await this.handleCharacterBuffSkill(member._id.toString(), skillBenefit.value, isAdding);
      }
    } catch (error) {
      console.error(`Error ${isAdding ? "applying" : "removing"} buff from party:`, error);
    }
  }

  private async handleCharacterBuffSkill(
    characterId: string,
    buffPercentage: number,
    isAdding: boolean = true
  ): Promise<void> {
    try {
      const character = (await Character.findById(characterId)
        .lean()
        .select("_id class channelId skills")) as ICharacter;

      const traits = this.getClassTraits(character.class as CharacterClass);
      const tasks = isAdding
        ? [this.applyCharacterBuff(character, traits, buffPercentage)]
        : [this.removeCharacterBuff(character, traits, buffPercentage)];

      await Promise.all(tasks);
    } catch (error) {
      console.error(`Error ${isAdding ? "applying" : "removing"} buff to character:`, error);
    }
  }

  private async removeCharacterBuff(character: ICharacter, traits: string[], buffPercentage: number): Promise<void> {
    for await (const trait of traits) {
      const buff = (await CharacterBuff.findOne({
        owner: character._id,
        trait,
        buffPercentage,
        durationType: CharacterBuffDurationType.Permanent,
      })
        .lean()
        .select("_id")) as ICharacterBuff;

      if (!buff) {
        return;
      }
      await this.characterBuffActivator.disableBuff(character, buff._id!, CharacterBuffType.Skill, true);
    }
  }

  private async applyCharacterBuff(character: ICharacter, traits: string[], buffPercentage: number): Promise<void> {
    const capitalizedTraits = traits.map((trait) => {
      if (trait === BasicAttribute.MagicResistance) {
        return "Magic Resistance";
      }

      return _.capitalize(trait);
    });

    const activationMessage = `Aura of ${capitalizedTraits.join(
      ", "
    )} boosts your skills by ${buffPercentage}% respectively.`;
    const deactivationMessage = `Aura of ${capitalizedTraits.join(
      ", "
    )} fades, reducing your skills by ${buffPercentage}% respectively.`;

    for await (const trait of traits) {
      const existingBuff = await CharacterBuff.findOne({
        owner: character._id,
        trait,
        buffPercentage,
        durationType: CharacterBuffDurationType.Permanent,
        originateFrom: "party",
      });

      if (existingBuff) continue;

      const buff = {
        type: CharacterBuffType.Skill,
        trait,
        buffPercentage,
        durationType: CharacterBuffDurationType.Permanent,
        skipAllMessages: false,
        skipDeactivationMessage: false,
        options: {
          messages: {
            activation: activationMessage,
            deactivation: deactivationMessage,
          },
        },
        originateFrom: "party",
      } as ICharacterPermanentBuff;

      await this.characterBuffActivator.enablePermanentBuff(character, buff, true);
    }
  }

  private getClassTraits(charClass: CharacterClass): BuffSkillTypes[] {
    const classTraits: Record<CharacterClass, BuffSkillTypes[]> = {
      None: [BasicAttribute.Strength, BasicAttribute.Resistance],
      Warrior: [BasicAttribute.Strength, BasicAttribute.Resistance],
      Berserker: [BasicAttribute.Strength, BasicAttribute.Resistance],
      Druid: [BasicAttribute.Magic, BasicAttribute.Resistance],
      Sorcerer: [BasicAttribute.Magic, BasicAttribute.MagicResistance],
      Rogue: [BasicAttribute.Dexterity, CombatSkill.Dagger],
      Hunter: [BasicAttribute.Dexterity, CombatSkill.Distance],
    };

    return classTraits[charClass] || [BasicAttribute.Strength, BasicAttribute.Resistance];
  }
}
