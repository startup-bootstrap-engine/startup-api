import { Model } from "mongoose";
import { ZodSchema } from "zod";
import { IBaseRepositoryFindByOptions } from "./repository/BaseRepository";

export interface IDatabaseAdapter {
  initialize(): Promise<void> | void;
  close(): Promise<void>;
}

export type DatabaseAdaptersAvailable = "mongoose" | "firebase";

export interface IRepositoryAdapter<T, Q = Record<string, unknown>> {
  init?(model: Model<T> | string, schema: ZodSchema<any>): Promise<void> | void;
  create(item: T): Promise<T>;
  findById(id: string, options?: IBaseRepositoryFindByOptions): Promise<T | null>;
  findBy(params: Q, options?: IBaseRepositoryFindByOptions): Promise<T | null>;
  findAll(params?: Q, options?: IBaseRepositoryFindByOptions): Promise<T[]>;
  updateById(id: string, item: Partial<T>): Promise<T | null>;
  updateBy(params: Q, item: Partial<T>): Promise<T | null>;
  delete(id: string): Promise<boolean>;
  exists(params: Q): Promise<boolean>;
}
