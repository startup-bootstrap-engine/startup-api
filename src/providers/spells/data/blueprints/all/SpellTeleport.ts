import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { container } from "@providers/inversify/container";
import { MapTransitionQueue } from "@providers/map/MapTransition/MapTransitionQueue";
import { AnimationEffectKeys, ISpell, SpellCastingType, SpellsBlueprint, ToGridX, ToGridY } from "@rpg-engine/shared";

export const spellTeleport: Partial<ISpell> = {
  key: SpellsBlueprint.Teleport,
  name: "Teleport",
  description: "Teleport to the town",
  textureAtlas: "icons",
  texturePath: "spell-icons/teleport.png",
  castingType: SpellCastingType.SelfCasting,
  magicWords: "na lû e guil i-'ôr",
  manaCost: 0,
  minLevelRequired: 2,
  minMagicLevelRequired: 1,
  cooldown: 60 * 60,
  castingAnimationKey: AnimationEffectKeys.Holy,

  usableEffect: async (character: ICharacter) => {
    const mapTransition = container.get<MapTransitionQueue>(MapTransitionQueue);

    await mapTransition.teleportCharacter(character, {
      map: character.initialScene,
      gridX: ToGridX(character.initialX),
      gridY: ToGridY(character.initialY),
    });
  },
};
