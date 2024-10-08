import { provide } from "inversify-binding-decorators";

import mongoose, { Document, Model } from "mongoose";
import { IRepositoryAdapter } from "../DatabaseTypes";
import { IBaseRepositoryFindByOptions } from "./BaseRepository";

@provide(MongooseRepository)
export class MongooseRepository<T extends Document> implements IRepositoryAdapter<T> {
  constructor(private model: Model<T>) {}

  public async create(item: T): Promise<T> {
    return await this.model.create(item);
  }

  public async findById(id: string, options?: IBaseRepositoryFindByOptions): Promise<T | null> {
    const query = this.model.findById(id).lean<T>();
    return await this.applyOptionsAndExecQuery(query, options);
  }

  public async findBy(params: mongoose.FilterQuery<T>, options?: IBaseRepositoryFindByOptions): Promise<T | null> {
    const query = this.model.findOne(params).lean<T>();
    return await this.applyOptionsAndExecQuery(query, options);
  }

  public async findAll(params: mongoose.FilterQuery<T>, options?: IBaseRepositoryFindByOptions): Promise<T[]> {
    const query = this.model.find(params as any).lean<T>();
    return (await this.applyOptionsAndExecQuery(query, options)) as unknown as T[];
  }

  private async applyOptionsAndExecQuery(query: any, options?: IBaseRepositoryFindByOptions): Promise<T | null> {
    if (!options) return await query.exec();

    if (options.select) {
      query = query.select(options.select);
    }

    if (options.limit) {
      query = query.limit(options.limit);
    }

    if (options.populate) {
      const populates = Array.isArray(options.populate) ? options.populate : [options.populate];
      populates.forEach((populateOption) => {
        query = query.populate(populateOption);
      });
    }

    if (options.virtuals) {
      query = query.setOptions({ virtuals: true });
    }

    if (options.defaults) {
      query = query.setOptions({ defaults: true });
    }

    if (options.cacheQuery) {
      query = query.setOptions({
        cacheKey: options.cacheQuery.cacheKey,
      });

      // Execute the query
      const result = await query.exec();

      return result;
    }

    return await query.exec();
  }

  public async updateById(id: string, item: Partial<T>): Promise<T | null> {
    return (await this.model
      .findByIdAndUpdate(id, item as any, { new: true })
      .lean()
      .exec()) as unknown as T | null;
  }

  public async updateBy(params: mongoose.FilterQuery<T>, item: Partial<T>): Promise<T | null> {
    return (await this.model
      .findOneAndUpdate(params, item as any, { new: true })
      .lean()
      .exec()) as unknown as T | null;
  }

  public async delete(id: string): Promise<boolean> {
    const result = await this.model.findByIdAndDelete(id).exec();
    return result !== null;
  }

  public async exists(params: mongoose.FilterQuery<T>): Promise<boolean> {
    return await this.model.exists(params);
  }
}
