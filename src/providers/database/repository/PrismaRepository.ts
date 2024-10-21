import { zodToObject } from "@entities/schemaUtils";
import { Prisma, PrismaClient } from "@prisma/client";
import { provide } from "inversify-binding-decorators";
import { ZodObject } from "zod";
import { PrismaAdapter } from "../adapters/PrismaAdapter";
import { IRepositoryAdapter } from "../DatabaseTypes";
import { IBaseRepositoryFindByOptions } from "./BaseRepository";

export type PrismaModelName = keyof PrismaClient;
export type PrismaModelDelegate = {
  name: any;
  create: (args: any) => Promise<any>;
  findUnique: (args: any) => Promise<any>;
  findFirst: (args: any) => Promise<any>;
  findMany: (args: any) => Promise<any[]>;
  update: (args: any) => Promise<any>;
  updateMany: (args: any) => Promise<Prisma.BatchPayload>;
  delete: (args: any) => Promise<any>;
  count: (args: any) => Promise<number>;
};

@provide(PrismaRepository)
export class PrismaRepository<T extends object> implements IRepositoryAdapter<T> {
  private prisma!: PrismaClient;
  private modelDelegate!: PrismaModelDelegate;
  private schema: ZodObject<any>;

  constructor(private prismaAdapter: PrismaAdapter) {}

  /**
   * Initializes the repository by setting up the Prisma client and model delegate.
   */
  public async init(modelName: PrismaModelName, schema: ZodObject<any>): Promise<void> {
    this.schema = schema;
    const prisma = this.prismaAdapter.getClient();
    const delegate = prisma[modelName];
    if (!delegate) {
      throw new Error(`Model ${String(modelName)} does not exist on Prisma Client.`);
    }
    this.modelDelegate = delegate as unknown as PrismaModelDelegate;

    // Ensure table exists
    await this.ensureTableExists();
  }

  private async ensureTableExists(): Promise<void> {
    try {
      // Attempt to query the table
      await this.modelDelegate.findFirst({});
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2021") {
        console.warn(`Table for model ${this.modelDelegate.name} does not exist. Running migrations...`);
        // Run Prisma migrations
        const { exec } = require("child_process");
        await new Promise((resolve, reject) => {
          exec("npx prisma migrate deploy", (error: Error | null, stdout: string, stderr: string) => {
            if (error) {
              console.error(`Migration error: ${error}`);
              reject(error);
              return;
            }
            console.log(`Migration stdout: ${stdout}`);
            console.error(`Migration stderr: ${stderr}`);
            resolve(stdout);
          });
        });
      } else {
        throw error;
      }
    }
  }

  public async create(item: T): Promise<T> {
    const validatedData = zodToObject(this.schema, item);
    return await this.modelDelegate.create({ data: validatedData });
  }

  public async findById(id: string, options?: IBaseRepositoryFindByOptions): Promise<T | null> {
    return await this.modelDelegate.findUnique({
      where: { id },
      select: options?.select ? this.parseSelect(options.select) : undefined,
      include: options?.populate ? this.parseInclude(options.populate) : undefined,
    });
  }

  public async findBy(params: Record<string, unknown>, options?: IBaseRepositoryFindByOptions): Promise<T | null> {
    try {
      const where = this.parseWhere(params);
      return await this.modelDelegate.findFirst({
        where,
        select: options?.select ? this.parseSelect(options.select) : undefined,
        include: options?.populate ? this.parseInclude(options.populate) : undefined,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2021") {
        console.error(`Table for model ${this.modelDelegate.name} does not exist in the database.`);
        return null;
      }
      throw error;
    }
  }

  public async findAll(params?: Record<string, unknown>, options?: IBaseRepositoryFindByOptions): Promise<T[]> {
    const where = params ? this.parseWhere(params) : undefined;
    return await this.modelDelegate.findMany({
      where,
      select: options?.select ? this.parseSelect(options.select) : undefined,
      include: options?.populate ? this.parseInclude(options.populate) : undefined,
      take: options?.limit,
    });
  }

  public async updateById(id: string, item: Partial<T>): Promise<T | null> {
    const validatedData = zodToObject(this.schema, item);
    return await this.modelDelegate.update({
      where: { id },
      data: validatedData,
    });
  }

  public async updateBy(params: Record<string, unknown>, item: Partial<T>): Promise<T | null> {
    const where = this.parseWhere(params);
    const validatedData = zodToObject(this.schema, item);
    await this.modelDelegate.updateMany({
      where,
      data: validatedData,
    });
    return this.findBy(params);
  }

  public async delete(id: string): Promise<boolean> {
    try {
      await this.modelDelegate.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  }

  public async exists(params: Record<string, unknown>): Promise<boolean> {
    try {
      const count = await this.modelDelegate.count({ where: this.parseWhere(params) });
      return count > 0;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2021") {
        // P2021 is the error code for "The table does not exist in the current database"
        console.error(`Table for model ${this.modelDelegate.name} does not exist in the database.`);
        return false;
      }
      throw error;
    }
  }

  private parseWhere(params: Record<string, unknown>): Prisma.Subset<any, any> {
    const where: any = {};

    for (const [key, value] of Object.entries(params)) {
      if (value === null) {
        where[key] = { is: null };
      } else if (typeof value === "object" && !Array.isArray(value)) {
        where[key] = this.parseWhere(value as Record<string, unknown>);
      } else if (Array.isArray(value)) {
        where[key] = { in: value };
      } else if (typeof value === "string" && (value.includes("%") || value.includes("_"))) {
        where[key] = { contains: value.replace(/%/g, "") };
      } else {
        where[key] = value;
      }
    }

    return where;
  }

  private parseSelect(select: string): Prisma.SelectSubset<any, any> {
    const fields = select.split(",").map((field) => field.trim());
    const selectObj: any = {};
    fields.forEach((field) => {
      selectObj[field] = true;
    });
    return selectObj;
  }

  private parseInclude(populate: string | string[]): Prisma.Subset<any, any> | undefined {
    if (typeof populate === "string") {
      return { [populate]: true };
    } else if (Array.isArray(populate)) {
      const includeObj: any = {};
      populate.forEach((field) => {
        includeObj[field] = true;
      });
      return includeObj;
    }
    return undefined;
  }
}
