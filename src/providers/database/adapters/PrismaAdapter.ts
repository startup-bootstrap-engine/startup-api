import { PrismaClient } from "@prisma/client";
import { provide } from "inversify-binding-decorators";
import { IDatabaseAdapter } from "../DatabaseTypes";

@provide(PrismaAdapter)
export class PrismaAdapter implements IDatabaseAdapter {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  public async initialize(): Promise<void> {
    try {
      await this.prisma.$connect();
      console.log("✅ Connected to the PostgreSQL database using Prisma.");
    } catch (error) {
      console.error("❌ Failed to connect to PostgreSQL with Prisma:", error);
      throw error;
    }
  }

  public async close(): Promise<void> {
    try {
      await this.prisma.$disconnect();
      console.log("✅ Disconnected from the PostgreSQL database.");
    } catch (error) {
      console.error("❌ Error disconnecting Prisma:", error);
      throw error;
    }
  }

  public getClient(): PrismaClient {
    return this.prisma;
  }
}