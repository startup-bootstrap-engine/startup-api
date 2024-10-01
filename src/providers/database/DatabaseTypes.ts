export interface IDatabaseAdapter {
  initialize(): Promise<void>;
  close(): Promise<void>;
}

export type DatabaseAdaptersAvailable = "mongoose";
