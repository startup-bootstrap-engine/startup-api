import { SpellCast } from "@providers/spells/SpellCast";
import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { INPC, NPC } from "@entities/ModuleNPC/NPCModel";
import { container, unitTestHelper } from "@providers/inversify/container";
import { ISkill, Skill } from "@entities/ModuleCharacter/SkillsModel";
import { CharacterClass, EntityType, SpellsBlueprint } from "@rpg-engine/shared";
import { npcNazgul } from "@providers/npc/data/blueprints/hostile/tier18/NPCNazgul";

describe("SpellBleedingEdge", () => {
  let character: ICharacter;
  let spellCast: SpellCast;
  let creature: INPC;

  beforeAll(() => {
    spellCast = container.get<SpellCast>(SpellCast);
  });

  beforeEach(async () => {
    character = await unitTestHelper.createMockCharacter(
      {
        learnedSpells: [SpellsBlueprint.BleedingEdge],
        class: CharacterClass.Warrior,
      },
      { hasEquipment: false, hasInventory: false, hasSkills: true }
    );

    creature = await unitTestHelper.createMockHostileNPC(npcNazgul, { hasSkills: true });
  });

  it("should successfully deal damage and apply bleeding effect to the target", async () => {
    const initialHealth = creature.health;
    const skills = (await Skill.findOne({ _id: character.skills }).lean()) as ISkill;
    skills.level = 99; // Setting level to 99 for the test
    skills.strength.level = 99; // Setting strength skill level to 99 for the test
    skills.magic.level = 99; // Setting magic skill level to 99 for the test

    await Skill.updateOne({ _id: character.skills }, skills);

    const spell = { magicWords: "ithilgil urui", targetId: creature._id, targetType: EntityType.NPC };
    expect(await spellCast.castSpell(spell, character)).toBeTruthy();

    const creatureHealthAfterHit = (await NPC.findById(creature._id)) as INPC;

    expect(creatureHealthAfterHit.health).toBeLessThan(initialHealth);
    expect(creatureHealthAfterHit.appliedEntityEffects).toHaveLength(1);
  });
});
