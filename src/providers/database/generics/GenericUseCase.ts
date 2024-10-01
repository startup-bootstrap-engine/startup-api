import { provide } from "inversify-binding-decorators";
import { Document, FilterQuery, Model } from "mongoose";
import { BaseRepository, IBaseRepositoryFindByOptions } from "../repository/BaseRepository";

@provide(GenericUseCase)
export class GenericUseCase<T extends Document> {
  constructor(protected model: Model<T>, protected repository: BaseRepository<T>) {}

  public async create(data: T): Promise<T> {
    return await this.repository.create(data);
  }

  public async findById(id: string, options?: IBaseRepositoryFindByOptions): Promise<T | null> {
    return await this.repository.findById(id, options);
  }

  public async findBy(params: FilterQuery<T>, options?: IBaseRepositoryFindByOptions): Promise<T | null> {
    return await this.repository.findBy(params, options);
  }

  public async findAll(query: FilterQuery<T>, options?: IBaseRepositoryFindByOptions): Promise<T[]> {
    return await this.repository.findAll(query, options);
  }

  public async updateById(id: string, data: Partial<T>): Promise<T | null> {
    return await this.repository.updateById(id, data);
  }

  public async updateBy(params: FilterQuery<T>, data: Partial<T>): Promise<T | null> {
    return await this.repository.updateBy(params, data);
  }

  public async delete(id: string): Promise<boolean> {
    return await this.repository.delete(id);
  }

  public async exists(id: string): Promise<boolean> {
    return await this.repository.exists({ _id: id });
  }
}
