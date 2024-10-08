import { AvailableSchemas } from "@entities/ModuleSystem/schemas/schemaIndex";
import { BadRequestError } from "@providers/errors/BadRequestError"; // Import BadRequestError
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
    try {
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
    } catch (error) {
      throw new BadRequestError(error.message);
    }
  }

  public async findById(id: string, options?: IBaseRepositoryFindByOptions): Promise<T | null> {
    try {
      return await this.repositoryAdapter.findById(id, options);
    } catch (error) {
      throw new BadRequestError(error.message);
    }
  }

  public async findBy(params: Record<string, unknown>, options?: IBaseRepositoryFindByOptions): Promise<T | null> {
    try {
      return await this.repositoryAdapter.findBy(params, options);
    } catch (error) {
      throw new BadRequestError(error.message);
    }
  }

  public async findAll(query: Record<string, unknown>, options?: IBaseRepositoryFindByOptions): Promise<T[]> {
    try {
      return await this.repositoryAdapter.findAll(query, options);
    } catch (error) {
      throw new BadRequestError(error.message);
    }
  }

  public async updateById(id: string, data: Partial<T>): Promise<T | null> {
    try {
      return await this.repositoryAdapter.updateById(id, data);
    } catch (error) {
      throw new BadRequestError(error.message);
    }
  }

  public async updateBy(params: Record<string, unknown>, data: Partial<T>): Promise<T | null> {
    try {
      return await this.repositoryAdapter.updateBy(params, data);
    } catch (error) {
      throw new BadRequestError(error.message);
    }
  }

  public async delete(id: string): Promise<boolean> {
    try {
      return await this.repositoryAdapter.delete(id);
    } catch (error) {
      throw new BadRequestError(error.message);
    }
  }

  public async exists(params: Record<string, unknown>): Promise<boolean> {
    try {
      return await this.repositoryAdapter.exists(params);
    } catch (error) {
      throw new BadRequestError(error.message);
    }
  }
}
