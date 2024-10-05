import { IBaseRepositoryFindByOptions } from "./repository/BaseRepository";

export interface IDatabaseAdapter {
  initialize(): Promise<void> | void;
  close(): Promise<void>;
}

export type DatabaseAdaptersAvailable = "mongoose" | "firebase";

export interface IRepositoryAdapter<T> {
  init?(baseModelName: string): Promise<void> | void;
  create(item: T): Promise<T>;
  findById(id: string, options?: IBaseRepositoryFindByOptions): Promise<T | null>;
  findBy(params: any, options?: IBaseRepositoryFindByOptions): Promise<T | null>;
  findAll(params?: any, options?: IBaseRepositoryFindByOptions): Promise<T[]>;
  updateById(id: string, item: Partial<T>): Promise<T | null>;
  updateBy(params: any, item: Partial<T>): Promise<T | null>;
  delete(id: string): Promise<boolean>;
  exists(params: any): Promise<boolean>;
}
