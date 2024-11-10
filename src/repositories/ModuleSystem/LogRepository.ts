import { LogModel } from "@entities/ModuleSystem/LogModel";
import { BaseRepository, IBaseRepository } from "@providers/database/repository/BaseRepository";
import { RepositoryFactory } from "@providers/database/repository/RepositoryFactory";
import { ILog, logSchema } from "@startup-engine/shared"; // Assuming logSchema is defined in shared
import { provide } from "inversify-binding-decorators";

@provide(LogRepository)
export class LogRepository extends BaseRepository<ILog> implements IBaseRepository<ILog> {
  constructor(
    private repositoryFactory: RepositoryFactory,
    private logModel: LogModel
  ) {
    super(repositoryFactory.createRepository<ILog>(logModel.initializeData(logSchema), logSchema));
  }

  public async createLog(action: string, emitter: string, target: string): Promise<ILog> {
    return await this.create({ action, emitter, target });
  }

  public async findLogsByAction(action: string, date: Date): Promise<ILog[]> {
    const logs = await this.findAll({
      action,
      createdAt: { $gte: date },
    });

    return logs; // Return the array of logs
  }
}
