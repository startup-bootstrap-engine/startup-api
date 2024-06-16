import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { EntityEffectUse } from "@providers/entityEffects/EntityEffectUse";
import { EntityEffectBlueprint } from "@providers/entityEffects/data/types/entityEffectBlueprintTypes";
import { container } from "@providers/inversify/container";
import { IUsableEffect, UsableEffectsBlueprint } from "./types";

export const clearBurningEntityEffect: IUsableEffect = {
  key: UsableEffectsBlueprint.ClearBleedingUsableEffect,
  usableEffect: async (character: ICharacter) => {
    const entityEffectUse = container.get(EntityEffectUse);

    await entityEffectUse.clearEntityEffect(EntityEffectBlueprint.Burning, character);
  },
  usableEffectDescription: "Stops burning",
};
