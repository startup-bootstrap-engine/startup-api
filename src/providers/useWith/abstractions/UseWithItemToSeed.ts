import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { ISkill, Skill } from "@entities/ModuleCharacter/SkillsModel";
import { ItemContainer } from "@entities/ModuleInventory/ItemContainerModel";
import { Item } from "@entities/ModuleInventory/ItemModel";
import { MapControlTimeModel } from "@entities/ModuleSystem/MapControlTimeModel";
import { BlueprintManager } from "@providers/blueprint/BlueprintManager";
import { CharacterInventory } from "@providers/character/CharacterInventory";
import { CharacterItemInventory } from "@providers/character/characterItems/CharacterItemInventory";
import { CharacterWeightQueue } from "@providers/character/weight/CharacterWeightQueue";
import { container } from "@providers/inversify/container";

import { IPosition } from "@providers/movement/MovementHelper";
import { WateringByRain } from "@providers/plant/WateringByRain";
import { IPlantItem } from "@providers/plant/data/blueprints/PlantItem";
import { PlantLifeCycle } from "@providers/plant/data/types/PlantTypes";
import { SimpleTutorial } from "@providers/simpleTutorial/SimpleTutorial";
import { SkillIncrease } from "@providers/skill/SkillIncrease";
import { SocketMessaging } from "@providers/sockets/SocketMessaging";
import {
  AvailableWeather,
  IBaseItemBlueprint,
  IEquipmentAndInventoryUpdatePayload,
  IItemContainer,
  ItemSocketEvents,
  ItemType,
} from "@rpg-engine/shared";
import { provide } from "inversify-binding-decorators";
import { clearCacheForKey } from "speedgoose";

export interface IUseWithItemToSeedOptions {
  map: string;
  coordinates: IPosition;
  key: string;
  originItemKey: string;
  successMessage: string;
  errorMessage: string;
}

@provide(UseWithItemToSeed)
export class UseWithItemToSeed {
  constructor(
    private socketMessaging: SocketMessaging,
    private characterItemInventory: CharacterItemInventory,
    private characterWeight: CharacterWeightQueue,
    private characterInventory: CharacterInventory,
    private simpleTutorial: SimpleTutorial,
    private wateringByRain: WateringByRain
  ) {}

  public async execute(
    character: ICharacter,
    options: IUseWithItemToSeedOptions,
    skillIncrease: SkillIncrease
  ): Promise<void> {
    const { map, coordinates, key, originItemKey, successMessage, errorMessage } = options;
    const blueprintManager = container.get<BlueprintManager>(BlueprintManager);

    try {
      const itemBlueprint = (await blueprintManager.getBlueprint("items", originItemKey)) as IBaseItemBlueprint;

      if (itemBlueprint?.minRequirements) {
        const meetsMinRequirements = await this.checkMinimumRequirements(character, itemBlueprint);

        if (!meetsMinRequirements) {
          const { level, skill } = itemBlueprint.minRequirements!;

          const message = `Sorry, this seed requires level ${level} and ${skill.level} level in ${skill.name}`;

          this.socketMessaging.sendErrorMessageToCharacter(character, message);
          return;
        }
      }

      const blueprint = (await blueprintManager.getBlueprint("plants", key)) as IPlantItem;

      if (!blueprint) {
        throw new Error(`Cannot find blueprint for key '${key}'`);
      }

      const requiredGrowthPoints = blueprint.stagesRequirements[PlantLifeCycle.Seed]?.requiredGrowthPoints ?? 0;

      const plantData = {
        ...blueprint,
        key,
        x: coordinates.x,
        y: coordinates.y,
        scene: map,
        owner: character.id,
        requiredGrowthPoints,
      };

      const newPlant = new Item(plantData);
      await newPlant.save();

      const mapControlTime = await MapControlTimeModel.findOne();

      if (
        mapControlTime &&
        (mapControlTime.weather === AvailableWeather.SoftRain || mapControlTime.weather === AvailableWeather.HeavyRain)
      ) {
        await this.wateringByRain.updatePlant(newPlant);
      }

      await this.characterItemInventory.decrementItemFromInventoryByKey(originItemKey, character, 1);
      await this.characterWeight.updateCharacterWeight(character);

      await skillIncrease.increaseCraftingSP(character, ItemType.Plant, true);

      this.socketMessaging.sendMessageToCharacter(character, successMessage);

      await this.simpleTutorial.sendSimpleTutorialActionToCharacter(character, "plant-seed");

      await this.cacheClear(character);

      await this.refreshInventory(character);
    } catch (error) {
      this.socketMessaging.sendErrorMessageToCharacter(character, errorMessage);
    }
  }

  private async cacheClear(character: ICharacter): Promise<void> {
    await clearCacheForKey(`${character._id}-inventory`);
  }

  private async checkMinimumRequirements(character: ICharacter, itemBlueprint: IBaseItemBlueprint): Promise<boolean> {
    const skill = (await Skill.findById(character.skills)
      .lean()
      .cacheQuery({
        cacheKey: `${character?._id}-skills`,
      })) as unknown as ISkill as ISkill;

    const minRequirements = itemBlueprint?.minRequirements;

    if (!minRequirements) return true;

    if (skill.level < minRequirements.level) return false;

    const skillsLevel: number = skill[minRequirements.skill.name]?.level ?? 0;

    if (skillsLevel < minRequirements.skill.level) return false;

    return true;
  }

  private async refreshInventory(character: ICharacter): Promise<void> {
    const inventory = await this.characterInventory.getInventory(character);
    const inventoryContainer = (await ItemContainer.findById(inventory?.itemContainer)) as unknown as IItemContainer;

    const payloadUpdate: IEquipmentAndInventoryUpdatePayload = {
      inventory: inventoryContainer,
      openEquipmentSetOnUpdate: false,
      openInventoryOnUpdate: true,
    };

    this.socketMessaging.sendEventToUser<IEquipmentAndInventoryUpdatePayload>(
      character.channelId!,
      ItemSocketEvents.EquipmentAndInventoryUpdate,
      payloadUpdate
    );
  }
}
