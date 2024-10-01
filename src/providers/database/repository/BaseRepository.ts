import { IRepositoryAdapter } from "@providers/database/DatabaseTypes";
import { ConflictError } from "@providers/errors/ConflictError";
import { TS } from "@providers/translation/TranslationHelper";
import { provide } from "inversify-binding-decorators";
import { Document, FilterQuery } from "mongoose";

export interface IBaseRepository<T extends Document> extends IRepositoryAdapter<T> {}

export interface IBaseRepositoryCreateOptions {
  uniqueByKey?: string;
}

export interface IBaseRepositoryFindByOptions {
  select?: string;
  populate?: string | string[];
  virtuals?: boolean;
  defaults?: boolean;
  cacheQuery?: {
    cacheKey: string;
  };
}

@provide(BaseRepository)
export class BaseRepository<T extends Document> implements IBaseRepository<T> {
  constructor(private repositoryAdapter: IRepositoryAdapter<T>) {}

  public async create(data: Partial<T>, options?: IBaseRepositoryCreateOptions): Promise<T> {
    if (options?.uniqueByKey) {
      const existing = await this.repositoryAdapter.findBy({ [options.uniqueByKey]: data[options.uniqueByKey] });
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

  public async update(id: string, data: Partial<T>): Promise<T | null> {
    return await this.repositoryAdapter.update(id, data);
  }

  public async delete(id: string): Promise<boolean> {
    return await this.repositoryAdapter.delete(id);
  }

  public async exists(params: Record<string, unknown>): Promise<boolean> {
    return await this.repositoryAdapter.exists(params);
  }
}
