import { Character } from "@entities/ModuleCharacter/CharacterModel";
import { Skill } from "@entities/ModuleCharacter/SkillsModel";
import { Depot } from "@entities/ModuleDepot/DepotModel";
import { ItemContainer } from "@entities/ModuleInventory/ItemContainerModel";
import { Item } from "@entities/ModuleInventory/ItemModel";
import { NPC } from "@entities/ModuleNPC/NPCModel";
import { User } from "@entities/ModuleSystem/UserModel";
import { BlueprintManager } from "@providers/blueprint/BlueprintManager";
import { MovementSpeed } from "@providers/constants/MovementConstants";
import { InMemoryHashTable } from "@providers/database/InMemoryHashTable";
import { BadRequestError } from "@providers/errors/BadRequestError";
import { ItemContainerBodyCleaner } from "@providers/item/cleaner/ItemContainerBodyCleaner";
import { ItemMissingReferenceCleaner } from "@providers/item/cleaner/ItemMissingReferenceCleaner";
import { ItemReportGenerator } from "@providers/item/ItemReportGenerator";
import { MarketplaceCleaner } from "@providers/marketplace/MarketplaceCleaner";
import { calculateSPToNextLevel, FromGridX, FromGridY, IItem } from "@rpg-engine/shared";
import * as csv from "fast-csv";
import fs from "fs";
import { provide } from "inversify-binding-decorators";
import { clearCacheForKey } from "speedgoose";

@provide(ScriptsUseCase)
export class ScriptsUseCase {
  constructor(
    private marketplaceCleaner: MarketplaceCleaner,
    private itemReportGenerator: ItemReportGenerator,
    private itemMissingReferenceCleaner: ItemMissingReferenceCleaner,
    private itemContainerBodyCleaner: ItemContainerBodyCleaner,
    private inMemoryHashTable: InMemoryHashTable,
    private blueprintManager: BlueprintManager
  ) {}

  public async updateItemMinRequirementsToMatchBlueprint(): Promise<void> {
    try {
      // Fetch all item keys that have minRequirements
      const itemsWithMinReq = await Item.find({ minRequirements: { $exists: true } }, { key: 1 }).lean();

      // Preparing bulk updates
      const bulkOps = itemsWithMinReq.map(async (item) => {
        try {
          const itemBlueprint: IItem = await this.blueprintManager.getBlueprint("items", item.key);

          if (!itemBlueprint || !itemBlueprint.minRequirements) {
            console.warn(`Skipping update for item key: ${item.key} as blueprint or minRequirements is undefined`);
            return null;
          }

          return {
            updateOne: {
              filter: { _id: item._id },
              update: { $set: { minRequirements: itemBlueprint.minRequirements } },
            },
          };
        } catch (error) {
          console.log("Failed to process item ", item.key);
          console.error(error);
          return null;
        }
      });

      // Resolving all promises and executing bulk write
      const operations = (await Promise.all(bulkOps)).filter((op) => op != null);

      // Executing bulk write with the successful operations
      if (operations.length > 0) {
        await Item.bulkWrite(operations);
      }
    } catch (error) {
      console.error(error);
    }
  }

  public async cleanupCharacterUserCache(characterId: string): Promise<void> {
    await clearCacheForKey(`character-${characterId}-user`);
  }

  public async cleanupItems(): Promise<void> {
    await this.itemMissingReferenceCleaner.cleanupItemsWithoutOwnership();
    await this.itemContainerBodyCleaner.cleanupBodies();
  }

  public async cleanupRedis(namespace: string): Promise<void> {
    await this.inMemoryHashTable.deleteAll(namespace);
  }

  public async generateReportItems(): Promise<void> {
    await this.itemReportGenerator.exec();
  }

  public async marketplaceClean(): Promise<void> {
    await this.marketplaceCleaner.clean();
  }

  public async setAllBaseSpeedsToStandard(): Promise<void> {
    try {
      await Character.updateMany(
        {},
        {
          $set: {
            baseSpeed: MovementSpeed.Standard,
          },
        }
      );
    } catch (error) {
      console.error(error);
    }
  }

  public async adjustInitialCoordinates(): Promise<void> {
    try {
      await Character.updateMany(
        {},
        {
          $set: {
            x: FromGridX(93),
            y: FromGridY(106),
            initialX: FromGridX(93),
            initialY: FromGridY(106),
            scene: "ilya",
          },
        }
      );
    } catch (error) {
      console.error(error);

      throw new BadRequestError("Failed to execute script!");
    }
  }

  public async UpdateFarmingSkills(): Promise<void> {
    try {
      await Skill.updateMany(
        {},
        {
          $set: {
            farming: {
              type: "Gathering",
              level: 1,
              skillPoints: 0,
              skillPointsToNextLevel: calculateSPToNextLevel(0, 2),
              lastSkillGain: new Date(),
            },
          },
        }
      );
    } catch (error) {
      console.error(error);
    }
  }

  public async fixDepotOwnership(): Promise<void> {
    const depots = await Depot.find({}).lean();

    const updateOperations = depots.map((depot) => ({
      updateOne: {
        filter: { _id: depot.itemContainer },
        update: { $set: { owner: depot.owner } },
      },
    }));

    await ItemContainer.bulkWrite(updateOperations);
  }

  public async dumpUserEmailsOnCsv(): Promise<void> {
    const users = await User.find({}, { email: 1 }).lean();

    const csvStream = csv.format({ headers: true });

    const writableStream = fs.createWriteStream("user-data.csv");

    writableStream.on("finish", function () {
      console.log("CSV file created!");
    });

    csvStream.pipe(writableStream);
    users.forEach((user) => {
      csvStream.write({ email: user.email });
    });
    csvStream.end();
  }

  public async farmlandDepotFix(): Promise<void> {
    // eslint-disable-next-line mongoose-lean/require-lean
    const depots = await Depot.find({
      key: "trader-farm-7",
    });

    const updateOperations = depots.map((depot) => ({
      updateOne: {
        filter: { _id: depot._id },
        update: { $set: { key: "trader-farm-71" } },
      },
    }));

    // update NPC key from trader-farm-7 to trader-farm-71

    await NPC.updateMany(
      { key: "trader-farm-7" },
      {
        $set: {
          key: "trader-farm-71",
        },
      }
    );

    await Depot.bulkWrite(updateOperations);
  }
}
