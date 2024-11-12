import { PrismaClient } from "@prisma/client";
import { provideSingleton } from "@providers/inversify/provideSingleton";
import { IDatabaseAdapter } from "../DatabaseTypes";

@provideSingleton(PrismaAdapter)
export class PrismaAdapter implements IDatabaseAdapter {
  private prisma: PrismaClient;

  constructor() {}

  public async initialize(): Promise<void> {
    try {
      const prisma = this.getClient();
      await prisma.$connect();
      console.log("✅ Connected to the PostgreSQL database using Prisma.");
    } catch (error) {
      console.error("❌ Failed to connect to PostgreSQL with Prisma:", error);
      throw error;
    }
  }

  public async close(): Promise<void> {
    try {
      const prisma = this.getClient();

      await prisma.$disconnect();
      console.log("✅ Disconnected from the PostgreSQL database.");
    } catch (error) {
      console.error("❌ Error disconnecting Prisma:", error);
      throw error;
    }
  }

  public getClient(): PrismaClient {
    if (this.prisma) {
      return this.prisma;
    }

    return new PrismaClient();
  }
}
