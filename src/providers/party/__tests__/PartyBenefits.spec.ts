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
import PartyManagement from "../PartyInvitation";

describe("Party Benefits", () => {
  let partyManagement: PartyManagement;
  let characterLeader: ICharacter;
  let firstMember: ICharacter;
  let secondMember: ICharacter;

  beforeAll(() => {
    partyManagement = container.get<PartyManagement>(PartyManagement);
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
    const result = partyManagement.calculatePartyBenefits(2, 2);
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
    const result = partyManagement.calculatePartyBenefits(3, 1);
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
    // @ts-ignore
    await partyManagement.createParty(characterLeader, firstMember);

    // @ts-ignore
    const party = await partyManagement.getPartyByCharacterId(characterLeader._id);

    const expectedBenefits = partyManagement.calculatePartyBenefits(
      2,
      characterLeader.class === firstMember.class ? 1 : 2
    );

    expect(party!.benefits!.map(({ benefit, value }) => ({ benefit, value }))).toEqual(expectedBenefits);
  });

  it("should calculate correct benefits for a party with 3 members", async () => {
    // @ts-ignore
    await partyManagement.createParty(characterLeader, firstMember);
    // @ts-ignore
    await partyManagement.addMemberToParty(characterLeader, secondMember, secondMember);

    // @ts-ignore
    const party = await partyManagement.getPartyByCharacterId(characterLeader._id);

    const expectedBenefits = partyManagement.calculatePartyBenefits(3, 3);

    expect(party!.benefits!.map(({ benefit, value }) => ({ benefit, value }))).toEqual(expectedBenefits);
  });

  it("should update benefits when a party member is removed", async () => {
    await partyManagement.acceptInvite(characterLeader, firstMember);

    const party = await partyManagement.acceptInvite(characterLeader, secondMember);

    const success = await partyManagement.leaveParty(party?._id, secondMember, secondMember);

    expect(success).toBeTruthy;

    const updatedParty = await partyManagement.getPartyByCharacterId(characterLeader._id);

    const expectedBenefits = partyManagement.calculatePartyBenefits(2, 2);

    expect(updatedParty!.benefits!.map(({ benefit, value }) => ({ benefit, value }))).toEqual(expectedBenefits);
  });
});
