import { provide } from "inversify-binding-decorators";

import { Document, FilterQuery, Model } from "mongoose";
import { IRepositoryAdapter } from "../DatabaseTypes";

@provide(MongooseRepository)
export class MongooseRepository<T extends Document> implements IRepositoryAdapter<T> {
  constructor(private model: Model<T>) {}

  public async create(item: T): Promise<T> {
    return await this.model.create(item);
  }

  public async findById(id: string): Promise<T | null> {
    return await this.model.findById(id).lean<T>().exec();
  }

  public async findBy(params: FilterQuery<T>): Promise<T | null> {
    return await this.model.findOne(params).lean<T>().exec();
  }

  public async update(id: string, item: Partial<T>): Promise<T | null> {
    return (await this.model
      .findByIdAndUpdate(id, item as any, { new: true })
      .lean()
      .exec()) as unknown as T | null;
  }

  public async delete(id: string): Promise<boolean> {
    const result = await this.model.findByIdAndDelete(id).exec();
    return result !== null;
  }

  public async exists(params: FilterQuery<T>): Promise<boolean> {
    return await this.model.exists(params);
  }
}
