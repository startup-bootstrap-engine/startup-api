import { AvailableSchemas } from "@entities/ModuleSystem/schemas/schemaIndex";
import { ConflictError } from "@providers/errors/ConflictError";
import { TS } from "@providers/translation/TranslationHelper";
import { provide } from "inversify-binding-decorators";
import { IRepositoryAdapter } from "../DatabaseTypes";

export interface IBaseRepository<T extends AvailableSchemas> extends IRepositoryAdapter<T, Record<string, unknown>> {}

export interface IBaseRepositoryCreateOptions {
  uniqueByKeys?: string | string[];
}

export interface IBaseRepositoryFindByOptions {
  select?: string;
  populate?: string | string[];
  virtuals?: boolean;
  defaults?: boolean;
  cacheQuery?: {
    cacheKey: string;
  };
  limit?: number;
}

@provide(BaseRepository)
export class BaseRepository<T extends AvailableSchemas> implements IBaseRepository<T> {
  constructor(private repositoryAdapter: IRepositoryAdapter<T, Record<string, unknown>>) {}

  public async create(data: Partial<T>, options?: IBaseRepositoryCreateOptions): Promise<T> {
    if (options?.uniqueByKeys) {
      const keys = Array.isArray(options.uniqueByKeys) ? options.uniqueByKeys : [options.uniqueByKeys];
      for (const key of keys) {
        const value = data[key];
        if (value != null) {
          const existing = await this.repositoryAdapter.findBy({ [key]: value });
          if (existing) {
            throw new ConflictError(
              TS.translate("validation", "alreadyExists", {
                field: key,
              })
            );
          }
        }
      }
    }
    return await this.repositoryAdapter.create(data as T);
  }

  public async findById(id: string, options?: IBaseRepositoryFindByOptions): Promise<T | null> {
    return await this.repositoryAdapter.findById(id, options);
  }

  public async findBy(params: Record<string, unknown>, options?: IBaseRepositoryFindByOptions): Promise<T | null> {
    return await this.repositoryAdapter.findBy(params, options);
  }

  public async findAll(query: Record<string, unknown>, options?: IBaseRepositoryFindByOptions): Promise<T[]> {
    return await this.repositoryAdapter.findAll(query, options);
  }

  public async updateById(id: string, data: Partial<T>): Promise<T | null> {
    return await this.repositoryAdapter.updateById(id, data);
  }

  public async updateBy(params: Record<string, unknown>, data: Partial<T>): Promise<T | null> {
    return await this.repositoryAdapter.updateBy(params, data);
  }

  public async delete(id: string): Promise<boolean> {
    return await this.repositoryAdapter.delete(id);
  }

  public async exists(params: Record<string, unknown>): Promise<boolean> {
    return await this.repositoryAdapter.exists(params);
  }
}
