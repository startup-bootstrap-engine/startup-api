import { itemsBlueprintIndex } from "@providers/item/data";
import { AvailableBlueprints } from "@providers/item/data/types/itemsBlueprintTypes";
import { usableEffectsIndex } from "@providers/item/data/usableEffects";
import { IUsableEffect, IUsableEffectRune } from "@providers/item/data/usableEffects/types";
import { npcsBlueprintIndex } from "@providers/npc/data";
import { questsBlueprintIndex } from "@providers/quest/data";
import { spellsBlueprintsIndex } from "@providers/spells/data";
import { recipeBlueprintsIndex } from "@providers/useWith/blueprints";
import { provide } from "inversify-binding-decorators";

export type BlueprintNamespaces = "npcs" | "items" | "spells" | "quests" | "recipes";

type IBlueprint = Record<string, any>; //! Will be refactored later

@provide(BlueprintManager)
export class BlueprintManager {
  constructor() {}

  public getBlueprint<T>(namespace: BlueprintNamespaces, key: AvailableBlueprints): T {
    const blueprint = this.getBlueprintFromKey<IBlueprint>(namespace, key);

    if (namespace === "items") {
      // if item, lookup for usable effect and inject it on the blueprint
      let usableEffectBlueprint = usableEffectsIndex[blueprint?.usableEffectKey as string] as
        | IUsableEffect
        | IUsableEffectRune;

      if (usableEffectBlueprint && blueprint) {
        blueprint.usableEffect = usableEffectBlueprint.usableEffect;
        blueprint.usableEffectDescription = usableEffectBlueprint.usableEffectDescription;

        usableEffectBlueprint = usableEffectBlueprint as IUsableEffectRune;
        if (usableEffectBlueprint.usableEntityEffect) {
          blueprint.usableEntityEffect = usableEffectBlueprint.usableEntityEffect;
        }
      }
    }

    return blueprint as T;
  }

  public getAllBlueprintKeys(namespace: BlueprintNamespaces): string[] {
    const blueprintIndex = this.getBlueprintIndex<IBlueprint>(namespace);

    return Object.keys(blueprintIndex);
  }

  public getAllBlueprintValues<T>(namespace: BlueprintNamespaces): T[] {
    const blueprints = this.getBlueprintIndex<IBlueprint>(namespace);

    return Object.values(blueprints);
  }

  public getBlueprintIndex<T>(namespace: BlueprintNamespaces): T {
    switch (namespace) {
      case "items":
        return itemsBlueprintIndex as T;
      case "npcs":
        return npcsBlueprintIndex as T;
      case "quests":
        return questsBlueprintIndex as T;
      case "recipes":
        return recipeBlueprintsIndex as T;
      case "spells":
        return spellsBlueprintsIndex as T;
      default:
        throw new Error(`Unknown namespace ${namespace}`);
    }
  }

  private getBlueprintFromKey<T>(namespace: BlueprintNamespaces, key: AvailableBlueprints): T {
    switch (namespace) {
      case "items":
        return itemsBlueprintIndex[key] as T;
      case "npcs":
        return npcsBlueprintIndex[key] as T;
      case "quests":
        return questsBlueprintIndex[key] as T;
      case "recipes":
        return recipeBlueprintsIndex[key] as T;
      case "spells":
        return spellsBlueprintsIndex[key] as T;
      default:
        throw new Error(`Unknown namespace ${namespace}`);
    }
  }
}
