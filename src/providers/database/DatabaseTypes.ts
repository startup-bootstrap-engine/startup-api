import { IBaseRepositoryFindByOptions } from "./repository/BaseRepository";

export interface IDatabaseAdapter {
  initialize(): Promise<void>;
  close(): Promise<void>;
}

export type DatabaseAdaptersAvailable = "mongoose";

export type RepositoriesAvailable = "mongoose";

export interface IRepositoryAdapter<T> {
  create(item: T): Promise<T>;
  findById(id: string, options?: IBaseRepositoryFindByOptions): Promise<T | null>;
  findBy(params: Record<string, unknown>, options?: IBaseRepositoryFindByOptions): Promise<T | null>;
  update(id: string, item: Partial<T>): Promise<T | null>;
  delete(id: string): Promise<boolean>;
  exists(params: Record<string, unknown>): Promise<boolean>;
}
