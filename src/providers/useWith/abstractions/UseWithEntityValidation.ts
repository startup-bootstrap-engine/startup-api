import { Character, ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { ISkill } from "@entities/ModuleCharacter/SkillsModel";
import { IItem } from "@entities/ModuleInventory/ItemModel";
import { INPC } from "@entities/ModuleNPC/NPCModel";
import { TrackNewRelicTransaction } from "@providers/analytics/decorator/TrackNewRelicTransaction";
import { BattleAttackRanged } from "@providers/battle/BattleAttackTarget/BattleAttackRanged";
import { CharacterValidation } from "@providers/character/CharacterValidation";
import { ToolsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { ItemValidation } from "@providers/item/validation/ItemValidation";
import { MapSolidsTrajectory } from "@providers/map/MapSolidsTrajectory";
import { MovementHelper } from "@providers/movement/MovementHelper";
import { SocketMessaging } from "@providers/sockets/SocketMessaging";
import { Stealth } from "@providers/spells/data/logic/rogue/Stealth";
import { EntityType, NPCAlignment } from "@rpg-engine/shared";
import { provide } from "inversify-binding-decorators";
import { IUseWithItemSource } from "./UseWithEntity";

const StaticEntity = "Item"; // <--- should be added to the EntityType enum from @rpg-engine/shared

@provide(UseWithEntityValidation)
export class UseWithEntityValidation {
  constructor(
    private battleRangedAttack: BattleAttackRanged,
    private stealth: Stealth,
    private characterValidation: CharacterValidation,
    private movementHelper: MovementHelper,
    private itemValidation: ItemValidation,
    private socketMessaging: SocketMessaging,
    private mapSolidsTrajectory: MapSolidsTrajectory
  ) {}

  public baseValidation(
    caster: ICharacter,
    item: IItem,
    blueprint: IUseWithItemSource,
    targetType: EntityType | typeof StaticEntity
  ): boolean {
    if (!item) {
      this.socketMessaging.sendErrorMessageToCharacter(caster, "Sorry, item you are trying to use was not found.");
      return false;
    }

    if (!blueprint || !(!!blueprint.power || targetType === StaticEntity) || !blueprint.usableEffect) {
      if (!blueprint || blueprint.key !== ToolsBlueprint.Scythe) {
        this.socketMessaging.sendErrorMessageToCharacter(caster, `Sorry, '${item.name}' cannot be used with target.`);
        return false;
      }
    }

    if (!this.characterValidation.hasBasicValidation(caster)) {
      return false;
    }

    return true;
  }

  @TrackNewRelicTransaction()
  public async validateTargetRequest(
    caster: ICharacter,
    target: ICharacter | INPC | IItem | null,
    item: IItem | null,
    blueprint: IUseWithItemSource,
    targetType: EntityType | typeof StaticEntity
  ): Promise<boolean> {
    const errorMessage = await this.getValidationErrorMessage(caster, target, item, blueprint, targetType);
    if (errorMessage) {
      this.socketMessaging.sendErrorMessageToCharacter(caster, errorMessage);
      return false;
    }
    return true;
  }

  private async getValidationErrorMessage(
    caster: ICharacter,
    target: ICharacter | INPC | IItem | null,
    item: IItem | null,
    blueprint: IUseWithItemSource,
    targetType: EntityType | typeof StaticEntity
  ): Promise<string | null> {
    if (!target) return "Sorry, your target was not found.";
    if (caster.scene !== target.scene) return "Sorry, your target is not on the same scene.";

    if (blueprint.canTargetNPC === false) {
      if (target.type === EntityType.NPC) {
        return "Sorry, your target is not valid.";
      }
    }
    if (targetType !== EntityType.Item && (await this.stealth.isInvisible(target as ICharacter | INPC))) {
      return "Sorry, your target is invisible.";
    }
    if ("isAlive" in target && !target.isAlive && targetType !== (StaticEntity as EntityType)) {
      return "Sorry, your target is dead.";
    }

    if (
      target.type === EntityType.Character &&
      !this.characterValidation.hasBasicValidation(target as ICharacter, this.getCharacterValidationCustomMessages())
    ) {
      return "Sorry, your target does not meet the basic validation criteria.";
    }
    if (
      target.type === EntityType.NPC &&
      (target as INPC).alignment !== NPCAlignment.Hostile &&
      targetType !== StaticEntity
    ) {
      return "Sorry, your target is not valid.";
    }
    if (!this.movementHelper.isUnderRange(caster.x, caster.y, target.x!, target.y!, blueprint.useWithMaxDistanceGrid)) {
      return "Sorry, your target is out of reach.";
    }
    if (!(await this.itemValidation.isItemInCharacterInventory(caster, item?._id))) {
      return "Sorry, the item is not in your inventory.";
    }
    const casterMagicLevel = (await this.getCasterMagicLevel(caster)) ?? 0;
    if (casterMagicLevel < blueprint.minMagicLevelRequired) {
      return `Sorry, '${blueprint.name}' can only be used at magic level '${blueprint.minMagicLevelRequired}' or greater.`;
    }
    if (await this.mapSolidsTrajectory.isSolidInTrajectory(caster, target as ICharacter | INPC)) {
      return "Sorry, there is an obstacle in the way.";
    }
    return null;
  }

  private getCharacterValidationCustomMessages(): Map<string, string> {
    return new Map([
      ["not-online", "Sorry, your target is offline."],
      ["banned", "Sorry, your target is banned."],
    ]);
  }

  private async getCasterMagicLevel(caster: ICharacter): Promise<number | null> {
    const updatedCharacter = (await Character.findOne({ _id: caster._id }).populate("skills")) as ICharacter;

    const skills = updatedCharacter.skills as unknown as ISkill;

    return skills?.magic?.level;
  }
}
