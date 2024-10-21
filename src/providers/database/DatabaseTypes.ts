import { IBaseRepositoryFindByOptions } from "./repository/BaseRepository";

export type DatabaseAdaptersAvailable = "mongoose" | "firebase" | "prisma";

export interface IDatabaseAdapter {
  initialize(): Promise<void> | void;
  close(): Promise<void> | void;
  // Add any other common methods if necessary
}

export interface IRepositoryAdapter<T> {
  create(item: T): Promise<T>;
  findById(id: string, options?: IBaseRepositoryFindByOptions): Promise<T | null>;
  findBy(params: Record<string, unknown>, options?: IBaseRepositoryFindByOptions): Promise<T | null>;
  findAll(params?: Record<string, unknown>, options?: IBaseRepositoryFindByOptions): Promise<T[]>;
  updateById(id: string, item: Partial<T>): Promise<T | null>;
  updateBy(params: Record<string, unknown>, item: Partial<T>): Promise<T | null>;
  delete(id: string): Promise<boolean>;
  exists(params: Record<string, unknown>): Promise<boolean>;
}
