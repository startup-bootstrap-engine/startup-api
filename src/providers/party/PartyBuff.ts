import { CharacterBuff } from "@entities/ModuleCharacter/CharacterBuffModel";
import { Character, ICharacter } from "@entities/ModuleCharacter/CharacterModel";
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
  ICharacterPermanentBuff,
} from "@rpg-engine/shared";
import { provide } from "inversify-binding-decorators";
import _ from "lodash";
import { PartyBenefitsCalculator } from "./PartyBenefitsCalculator";
import { PartyClasses } from "./PartyClasses";
import { ICharacterParty } from "./PartyTypes";

type BuffSkillTypes = BasicAttribute | CombatSkill | CraftingSkill | CharacterAttributes;

@provide(PartyBuff)
export class PartyBuff {
  constructor(
    private characterBuffActivator: CharacterBuffActivator,
    private partyBenefitsCalculator: PartyBenefitsCalculator,
    private partyClasses: PartyClasses
  ) {}

  // CHARACTERS BUFFS
  public async handleAllBuffInParty(party: ICharacterParty, isAdding: boolean): Promise<void> {
    const differentClasses = this.partyClasses.getDifferentClasses(party);
    const { leader, members, size } = party;
    const numberOfMembers = size || members.length + 1;
    const benefits = this.partyBenefitsCalculator.calculatePartyBenefits(numberOfMembers, differentClasses);

    const skillBenefit = benefits.find((benefit) => benefit.benefit === CharacterPartyBenefits.Skill);

    if (!skillBenefit) return;

    const buffSkillPromises = [
      this.handleCharacterBuffSkill(leader._id.toString(), skillBenefit.value, isAdding),
      ...members.map((member) => this.handleCharacterBuffSkill(member._id.toString(), skillBenefit.value, isAdding)),
    ];

    try {
      await Promise.all(buffSkillPromises);
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
      const buffTask = isAdding
        ? this.applyCharacterBuff(character, traits, buffPercentage)
        : this.removeCharacterBuff(character, traits, buffPercentage);

      await buffTask;
    } catch (error) {
      console.error(`Error ${isAdding ? "applying" : "removing"} buff to character:`, error);
    }
  }

  private async removeCharacterBuff(character: ICharacter, traits: string[], buffPercentage: number): Promise<void> {
    const removeBuffPromises = traits.map(async (trait) => {
      const buff = await CharacterBuff.findOne({
        owner: character._id,
        trait,
        buffPercentage,
        durationType: CharacterBuffDurationType.Permanent,
      })
        .lean()
        .select("_id");

      if (buff) {
        await this.characterBuffActivator.disableBuff(character, buff._id!, CharacterBuffType.Skill, true);
      }
    });

    await Promise.all(removeBuffPromises);
  }

  private async applyCharacterBuff(character: ICharacter, traits: string[], buffPercentage: number): Promise<void> {
    const capitalizedTraits = traits.map((trait) => {
      return trait === BasicAttribute.MagicResistance ? "Magic Resistance" : _.capitalize(trait);
    });

    const activationMessage = `Aura of ${capitalizedTraits.join(
      ", "
    )} boosts your skills by ${buffPercentage}% respectively.`;
    const deactivationMessage = `Aura of ${capitalizedTraits.join(
      ", "
    )} fades, reducing your skills by ${buffPercentage}% respectively.`;

    const applyBuffPromises = traits.map(async (trait) => {
      const existingBuff = await CharacterBuff.findOne({
        owner: character._id,
        trait,
        buffPercentage,
        durationType: CharacterBuffDurationType.Permanent,
        originateFrom: "party",
      });

      if (!existingBuff) {
        const buff: ICharacterPermanentBuff = {
          type: CharacterBuffType.Skill,
          trait: trait as BuffSkillTypes,
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
    });

    await Promise.all(applyBuffPromises);
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
