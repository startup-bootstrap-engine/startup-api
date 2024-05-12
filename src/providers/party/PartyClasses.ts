import { provide } from "inversify-binding-decorators";
import { ICharacterParty } from "./PartyTypes";

@provide(PartyClasses)
export class PartyClasses {
  public getDifferentClasses(party: ICharacterParty): number {
    const leaderClass = party.leader.class;
    const memberClasses = party.members.map((member) => member.class);

    memberClasses.push(leaderClass);
    const uniqueClasses = new Set(memberClasses);

    return uniqueClasses.size;
  }
}
