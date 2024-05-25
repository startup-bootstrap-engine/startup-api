import { Character, ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { INPC } from "@entities/ModuleNPC/NPCModel";
import { provide } from "inversify-binding-decorators";
import { Types } from "mongoose";
import { PartyCRUD } from "./PartyCRUD";
import { ICharacterParty } from "./PartyTypes";

@provide(PartyValidator)
export class PartyValidator {
  constructor(private partyCRUD: PartyCRUD) {}

  public async checkIfCharacterAndTargetOnTheSameParty(character: ICharacter, target: ICharacter): Promise<boolean> {
    const party = await this.partyCRUD.findPartyByCharacterId(character._id);

    if (!party) return false;

    const theyAreInSameParty =
      party.members.some((member) => member._id.toString() === target._id.toString()) ||
      party.leader._id.toString() === target._id.toString();

    return theyAreInSameParty;
  }

  public checkIfIsLeader(party: ICharacterParty, eventCaller: ICharacter): boolean {
    if (!party) {
      return false;
    }

    return party.leader._id.toString() === eventCaller._id.toString();
  }

  public checkIfIsSameTarget(targetOfEventId: string, eventCallerId: string): boolean {
    if (!targetOfEventId || !eventCallerId) {
      return false;
    }

    return eventCallerId.toString() === targetOfEventId.toString();
  }

  public checkIfInParty(party: ICharacterParty, eventCaller: ICharacter): boolean {
    if (!party) {
      return false;
    }

    const isMember = party.members.some((member) => member._id.toString() === eventCaller._id.toString());

    const isLeader = party.leader._id.toString() === eventCaller._id.toString();

    return isMember || isLeader;
  }

  public areBothInSameParty(party: ICharacterParty, eventCaller: ICharacter, target: ICharacter): boolean {
    if (!party) {
      return false;
    }

    const isEventCallerInParty =
      party.members.some((member) => member._id.toString() === eventCaller._id.toString()) ||
      party.leader._id.toString() === eventCaller._id.toString();

    const isTargetInParty =
      party.members.some((member) => member._id.toString() === target._id.toString()) ||
      party.leader._id.toString() === target._id.toString();

    return isEventCallerInParty && isTargetInParty;
  }

  public async checkIfPartyHaveFreeSlots(character: ICharacter): Promise<boolean> {
    const party = await this.partyCRUD.findPartyByCharacterId(character._id);

    if (!party) {
      return true;
    }

    const maxSize = party.maxSize;
    const actualSize = party.size;

    if (actualSize >= maxSize) {
      return false;
    }

    return true;
  }

  public async isWithinRange(
    target: INPC,
    charactersId: Types.ObjectId[],
    maxDistance: number
  ): Promise<Set<Types.ObjectId>> {
    const charactersInRange = new Set<Types.ObjectId>();
    const maxDistanceSquared = maxDistance * maxDistance;
    const characters = (await Character.find({
      _id: { $in: charactersId },
    })
      .lean()
      .select("_id scene x y isAlive isOnline")) as ICharacter[];

    if (!characters) {
      return charactersInRange;
    }

    for (const character of characters) {
      if (
        target.scene !== character.scene ||
        character.isAlive === false ||
        character.health === 0 ||
        character.isOnline === false
      ) {
        continue;
      }

      const dx = target.x - character.x;
      const dy = target.y - character.y;
      const distanceSquared = dx * dx + dy * dy;

      if (distanceSquared <= maxDistanceSquared) {
        charactersInRange.add(character._id);
      }
    }

    return charactersInRange;
  }
}
