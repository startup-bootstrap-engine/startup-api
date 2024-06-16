import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { INPC } from "@entities/ModuleNPC/NPCModel";
import { TrackNewRelicTransaction } from "@providers/analytics/decorator/TrackNewRelicTransaction";
import { AnimationEffect } from "@providers/animation/AnimationEffect";
import { BlueprintManager } from "@providers/blueprint/BlueprintManager";
import { NPC_BOOST_HEALING_WHEN_DYING_PROBABILITY } from "@providers/constants/NPCConstants";
import { MapSolidsTrajectory } from "@providers/map/MapSolidsTrajectory";
import { MovementHelper } from "@providers/movement/MovementHelper";
import { spellsBlueprints } from "@providers/spells/data/blueprints";
import { ISpell, MagicPower, SpellCastingType, SpellsBlueprint } from "@rpg-engine/shared";
import { provide } from "inversify-binding-decorators";
import { random } from "lodash";

export interface ISpellAreaNPC {
  spellKey: SpellsBlueprint;
  probability: number;
  power: MagicPower;
}

@provide(NPCSpellArea)
export class NPCSpellArea {
  constructor(
    private blueprintManager: BlueprintManager,
    private movementHelper: MovementHelper,
    private mapSolidsTrajectory: MapSolidsTrajectory,
    private animationEffect: AnimationEffect
  ) {}

  @TrackNewRelicTransaction()
  public async castNPCSpell(attacker: INPC, target: ICharacter | INPC): Promise<boolean | undefined> {
    try {
      const hasSolidInTrajectory = await this.mapSolidsTrajectory.isSolidInTrajectory(attacker, target);

      if (hasSolidInTrajectory) {
        return false;
      }

      const npcBlueprint = (await this.blueprintManager.getBlueprint("npcs", attacker.baseKey as any)) as Record<
        string,
        unknown
      >;

      if (!npcBlueprint) {
        return false;
      }

      const areaSpells = npcBlueprint?.areaSpells as ISpellAreaNPC[];

      if (!areaSpells?.length) {
        return false;
      }

      // If NPC is dying, prioritize self-healing spells
      const isDying = attacker.health / attacker.maxHealth <= 0.2;
      let areaSpell: ISpellAreaNPC | undefined;

      if (isDying) {
        areaSpell = areaSpells.find((spell) => spell.spellKey === SpellsBlueprint.SelfHealingSpell);
      }

      // If no self-healing spell is found or NPC is not dying, choose randomly one of the areaSpells available
      if (!areaSpell) {
        areaSpell = areaSpells[random(0, areaSpells.length - 1)];
      }

      // Dynamically boost probability if NPC is dying
      let boostedProbability = areaSpell.probability;
      if (isDying) {
        boostedProbability = Math.min(100, areaSpell.probability * NPC_BOOST_HEALING_WHEN_DYING_PROBABILITY); //  2.5 is the boost factor
      }

      // Check probability to cast the area spell
      const n = random(0, 100);

      if (n > boostedProbability) {
        return false;
      }

      const spell = spellsBlueprints[areaSpell.spellKey] as ISpell;
      if (!spell) {
        throw new Error(`Spell ${areaSpell.spellKey} not found!`);
      }

      if (spell.castingType === SpellCastingType.SelfCasting) {
        if (spell.castingAnimationKey) {
          await this.animationEffect.sendAnimationEventToNPC(attacker, spell.castingAnimationKey);
        }

        await spell.usableEffect(attacker);

        return true;
      }

      const attackInRange = this.movementHelper.isUnderRange(
        attacker.x,
        attacker.y,
        target.x,
        target.y,
        spell.maxDistanceGrid || 0
      );

      if (!attackInRange) {
        return false;
      }

      await spell.usableEffect(attacker, target);

      return true;
    } catch (error) {
      console.error(error);
    }
  }
}
