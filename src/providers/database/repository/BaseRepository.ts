import { IRepositoryAdapter } from "@providers/database/DatabaseTypes";
import { ConflictError } from "@providers/errors/ConflictError";
import { TS } from "@providers/translation/TranslationHelper";
import { provide } from "inversify-binding-decorators";
import { Document, FilterQuery } from "mongoose";

export interface IBaseRepository<T extends Document> extends IRepositoryAdapter<T> {}

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
export class BaseRepository<T extends Document> implements IBaseRepository<T> {
  constructor(private repositoryAdapter: IRepositoryAdapter<T>) {}

  public async create(data: Partial<T>, options?: IBaseRepositoryCreateOptions): Promise<T> {
    if (options?.uniqueByKeys) {
      const keys = Array.isArray(options.uniqueByKeys) ? options.uniqueByKeys : [options.uniqueByKeys];
      const existing = await this.repositoryAdapter.findBy({
        $or: keys.map((key) => ({ [key]: data[key] })),
      });
      if (existing) {
        throw new ConflictError(
          TS.translate("validation", "alreadyExists", {
            // @ts-ignore
            field: this.repositoryAdapter.model.modelName,
          })
        );
      }
    }
    return await this.repositoryAdapter.create(data as T);
  }

  public async findById(id: string, options?: IBaseRepositoryFindByOptions): Promise<T | null> {
    return await this.repositoryAdapter.findById(id, options);
  }

  public async findBy(params: FilterQuery<T>, options?: IBaseRepositoryFindByOptions): Promise<T | null> {
    return await this.repositoryAdapter.findBy(params, options);
  }

  public async findAll(query: FilterQuery<T>, options?: IBaseRepositoryFindByOptions): Promise<T[]> {
    return await this.repositoryAdapter.findAll(query, options);
  }

  public async updateById(id: string, data: Partial<T>): Promise<T | null> {
    return await this.repositoryAdapter.updateById(id, data);
  }

  public async updateBy(params: FilterQuery<T>, data: Partial<T>): Promise<T | null> {
    return await this.repositoryAdapter.updateBy(params, data);
  }

  public async delete(id: string): Promise<boolean> {
    return await this.repositoryAdapter.delete(id);
  }

  public async exists(params: Record<string, unknown>): Promise<boolean> {
    return await this.repositoryAdapter.exists(params);
  }
}
