import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { CharacterClass, CharacterPartyBenefits } from "@rpg-engine/shared";

export interface IPartyLeader extends Partial<ICharacter> {
  _id: string;
  name: string;
}

export interface IPartyMember {
  _id: string;
  class: CharacterClass;
  name: string;
}

export interface IPartyBenefit {
  benefit: CharacterPartyBenefits;
  value: number;
}

export interface ICharacterParty {
  _id: string;
  leader: IPartyLeader;
  members: IPartyMember[];
  maxSize: number;
  benefits: IPartyBenefit[];
  size: number;
}
