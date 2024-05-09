import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { container, unitTestHelper } from "@providers/inversify/container";

import {
  CharacterClass,
  CharacterPartyBenefits,
  CharacterPartyDistributionBonus,
  CharacterPartyDropBonus,
  CharacterPartyEXPBonus,
  CharacterPartySkillBonus,
} from "@rpg-engine/shared";
import { PartyBenefitsCalculator } from "../PartyBenefitsCalculator";
import { PartyCRUD } from "../PartyCRUD";
import PartyInvitation from "../PartyInvitation";
import { PartyMembers } from "../PartyMembers";
import { ICharacterParty } from "../PartyTypes";

describe("PartyBenefitsCalculator", () => {
  let partyBenefitsCalculator: PartyBenefitsCalculator;
  let partyInvitation: PartyInvitation;
  let partyCRUD: PartyCRUD;
  let partyMembers: PartyMembers;

  let characterLeader: ICharacter;
  let firstMember: ICharacter;
  let secondMember: ICharacter;

  beforeAll(() => {
    partyInvitation = container.get<PartyInvitation>(PartyInvitation);
    partyBenefitsCalculator = container.get<PartyBenefitsCalculator>(PartyBenefitsCalculator);
    partyCRUD = container.get<PartyCRUD>(PartyCRUD);
    partyMembers = container.get<PartyMembers>(PartyMembers);
  });

  beforeEach(async () => {
    characterLeader = await unitTestHelper.createMockCharacter(
      {
        class: CharacterClass.Rogue,
      },
      {
        hasEquipment: true,
        hasSkills: true,
        hasInventory: true,
      }
    );

    firstMember = await unitTestHelper.createMockCharacter(
      {
        class: CharacterClass.Berserker,
      },
      {
        hasEquipment: true,
        hasSkills: true,
        hasInventory: true,
      }
    );

    secondMember = await unitTestHelper.createMockCharacter(
      {
        class: CharacterClass.Hunter,
      },
      {
        hasEquipment: true,
        hasSkills: true,
        hasInventory: true,
      }
    );
  });

  afterAll(() => {
    jest.clearAllMocks();
  });

  it("should calculate benefits for a party of size 2 with 2 unique classes", () => {
    const result = partyBenefitsCalculator.calculatePartyBenefits(2, 2);
    expect(result).toEqual([
      {
        benefit: CharacterPartyBenefits.Distribution,
        value: CharacterPartyDistributionBonus.Two,
      },
      {
        benefit: CharacterPartyBenefits.Experience,
        value: CharacterPartyEXPBonus.Two,
      },
      {
        benefit: CharacterPartyBenefits.DropRatio,
        value: CharacterPartyDropBonus.Two,
      },
      {
        benefit: CharacterPartyBenefits.Skill,
        value: CharacterPartySkillBonus.Two,
      },
    ]);
  });

  it("should calculate benefits for a party of size 3 with 1 unique class", () => {
    const result = partyBenefitsCalculator.calculatePartyBenefits(3, 1);
    expect(result).toEqual([
      {
        benefit: CharacterPartyBenefits.Distribution,
        value: CharacterPartyDistributionBonus.Three,
      },
      {
        benefit: CharacterPartyBenefits.Experience,
        value: CharacterPartyEXPBonus.One,
      },
      {
        benefit: CharacterPartyBenefits.DropRatio,
        value: CharacterPartyDropBonus.Three,
      },
      {
        benefit: CharacterPartyBenefits.Skill,
        value: CharacterPartySkillBonus.Three,
      },
    ]);
  });

  it("should calculate correct benefits for a party with 2 members", async () => {
    await partyCRUD.createParty(characterLeader, firstMember);

    const party = await partyCRUD.findPartyByCharacterId(characterLeader._id);

    const expectedBenefits = partyBenefitsCalculator.calculatePartyBenefits(
      2,
      characterLeader.class === firstMember.class ? 1 : 2
    );

    expect(party!.benefits!.map(({ benefit, value }) => ({ benefit, value }))).toEqual(expectedBenefits);
  });

  it("should calculate correct benefits for a party with 3 members", async () => {
    await partyCRUD.createParty(characterLeader, firstMember);

    // @ts-ignore
    await partyInvitation.addMemberToParty(characterLeader, secondMember);

    const party = await partyCRUD.findPartyByCharacterId(characterLeader._id);

    const expectedBenefits = partyBenefitsCalculator.calculatePartyBenefits(3, 3);

    expect(party!.benefits!.map(({ benefit, value }) => ({ benefit, value }))).toEqual(expectedBenefits);
  });

  it("should update benefits when a party member is removed", async () => {
    await partyInvitation.acceptInvite(characterLeader, firstMember);

    const party = (await partyInvitation.acceptInvite(characterLeader, secondMember)) as ICharacterParty;

    const success = await partyMembers.leaveParty(party?._id, secondMember, secondMember);

    expect(success).toBeTruthy;

    const updatedParty = await partyCRUD.findPartyByCharacterId(characterLeader._id);

    const expectedBenefits = partyBenefitsCalculator.calculatePartyBenefits(2, 2);

    expect(updatedParty!.benefits!.map(({ benefit, value }) => ({ benefit, value }))).toEqual(expectedBenefits);
  });
});
