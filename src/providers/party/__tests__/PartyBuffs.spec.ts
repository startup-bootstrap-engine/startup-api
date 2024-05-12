import { CharacterBuff } from "@entities/ModuleCharacter/CharacterBuffModel";
import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { container, unitTestHelper } from "@providers/inversify/container";

import { CharacterBuffDurationType, CharacterClass } from "@rpg-engine/shared";
import { PartyBuff } from "../PartyBuff";
import { PartyCRUD } from "../PartyCRUD";

describe("PartyBuffs", () => {
  let partyCRUD: PartyCRUD;

  let partyBuff: PartyBuff;

  let characterLeader: ICharacter;

  let messageSpy: jest.SpyInstance;

  beforeAll(() => {
    partyCRUD = container.get<PartyCRUD>(PartyCRUD);

    partyBuff = container.get<PartyBuff>(PartyBuff);

    // @ts-ignore
    messageSpy = jest.spyOn(partyCRUD.socketMessaging, "sendEventToUser");
  });

  beforeEach(async () => {
    characterLeader = await unitTestHelper.createMockCharacter(
      {
        class: CharacterClass.Rogue,
        name: "Character Leader",
      },
      {
        hasEquipment: true,
        hasSkills: true,
        hasInventory: true,
      }
    );
  });

  afterEach(() => {
    messageSpy.mockClear();
  });

  afterAll(() => {
    jest.clearAllMocks();
  });

  it("should add buffs to the party once only when call applyCharacterBuff", async () => {
    const trait = ["strength"];

    // @ts-ignore
    await partyBuff.applyCharacterBuff(characterLeader, trait, 2);
    // @ts-ignore
    await partyBuff.applyCharacterBuff(characterLeader, trait, 2);

    const partyBuffs = await CharacterBuff.find({
      owner: characterLeader._id,
      trait: trait[0],
      durationType: CharacterBuffDurationType.Permanent,
      originateFrom: "party",
    }).lean();

    expect(partyBuffs.length).toBe(1);
  });

  it("should delete all buffs from the party when call removeCharacterBuff", async () => {
    const trait = ["strength"];

    // @ts-ignore
    await partyBuff.applyCharacterBuff(characterLeader, trait, 2);

    // @ts-ignore
    await partyBuff.removeCharacterBuff(characterLeader, trait, 2);

    const partyBuffs = await CharacterBuff.find({
      owner: characterLeader._id,
      trait: trait[0],
      durationType: CharacterBuffDurationType.Permanent,
      originateFrom: "party",
    }).lean();

    expect(partyBuffs.length).toBe(0);
  });
});
