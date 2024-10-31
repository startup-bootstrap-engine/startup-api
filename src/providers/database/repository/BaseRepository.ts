import { AvailableSchemas } from "@entities/ModuleSystem/schemas/schemaIndex";
import { BadRequestError } from "@providers/errors/BadRequestError"; // Import BadRequestError
import { ConflictError } from "@providers/errors/ConflictError";
import { TS } from "@providers/translation/TranslationHelper";
import { provide } from "inversify-binding-decorators";
import type { IRepositoryAdapter } from "../DatabaseTypes";

export interface IBaseRepository<T extends AvailableSchemas> extends IRepositoryAdapter<T> {}

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
  hideSensitiveFields?: string[];
}

@provide(BaseRepository)
export class BaseRepository<T extends AvailableSchemas> implements IBaseRepository<T> {
  constructor(private repositoryAdapter: IRepositoryAdapter<T>) {}

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

      let result = await this.repositoryAdapter.create(data as T);

      result = this.autoPopulateMissingFields(result) as T;

      return result;
    } catch (error) {
      throw new BadRequestError(error.message);
    }
  }

  private hideSensitiveFields(item: T | null, hideSensitiveFields?: string[]): T | null {
    if (item && hideSensitiveFields && hideSensitiveFields.length > 0) {
      const { ...rest } = item;
      hideSensitiveFields.forEach((field) => {
        delete rest[field];
      });
      return rest as T;
    }
    return item;
  }

  public async findById(id: string, options?: IBaseRepositoryFindByOptions): Promise<T | null> {
    try {
      let result = await this.repositoryAdapter.findById(id, options);

      result = this.autoPopulateMissingFields(result);
      return this.hideSensitiveFields(result, options?.hideSensitiveFields);
    } catch (error) {
      throw new BadRequestError(error.message);
    }
  }

  public async findBy(params: Record<string, unknown>, options?: IBaseRepositoryFindByOptions): Promise<T | null> {
    try {
      let result = await this.repositoryAdapter.findBy(params, options);

      result = this.autoPopulateMissingFields(result);

      return this.hideSensitiveFields(result, options?.hideSensitiveFields);
    } catch (error) {
      throw new BadRequestError(error.message);
    }
  }

  public async findAll(query: Record<string, unknown>, options?: IBaseRepositoryFindByOptions): Promise<T[]> {
    let results = await this.repositoryAdapter.findAll(query, options);

    results = results.map((item) => this.autoPopulateMissingFields(item) as T);

    return results.map((item) => this.hideSensitiveFields(item, options?.hideSensitiveFields)) as T[];
  }

  public async updateById(id: string, data: Partial<T>): Promise<T | null> {
    try {
      let result = await this.repositoryAdapter.updateById(id, data);

      result = this.autoPopulateMissingFields(result) as T;

      return result;
    } catch (error) {
      throw new BadRequestError(error.message);
    }
  }

  public async updateBy(params: Record<string, unknown>, data: Partial<T>): Promise<T | null> {
    try {
      let result = await this.repositoryAdapter.updateBy(params, data);

      result = this.autoPopulateMissingFields(result) as T;

      return result;
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

  private autoPopulateMissingFields(result: T | null): T | null {
    // noSQL like MongoDB will return an _id instead of id. For consistency, we will fix it and delete the _id, returning the id instead.
    if (result && "_id" in result) {
      result.id = result._id?.toString()!;
      delete result._id;
    }
    return result;
  }
}
