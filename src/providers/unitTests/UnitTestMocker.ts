import { IUser, UserAuthFlow } from "@startup-engine/shared";
import bcrypt from "bcrypt";

export class UnitTestMocker {
  public static async createMockUser(overrides: Partial<IUser> = {}): Promise<IUser> {
    const password = "password123";
    const salt = "$2b$10$m0nisNV7q2tJhp0OSaRZfe";
    const hashedPassword = await bcrypt.hash(password, salt);

    const defaultUser: IUser = {
      _id: "mock-user-id",
      email: "test@example.com",
      password: hashedPassword,
      salt,
      authFlow: UserAuthFlow.Basic,
      refreshTokens: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    } as IUser;

    return {
      ...defaultUser,
      ...overrides,
    };
  }

  public static createMockTokens(): { accessToken: string; refreshToken: string } {
    return {
      accessToken: "mock-access-token",
      refreshToken: "mock-refresh-token",
    };
  }

  public static createMockAuthDTO(): { email: string; password: string; passwordConfirmation: string } {
    return {
      email: "test@example.com",
      password: "password123",
      passwordConfirmation: "password123",
    };
  }

  public static createMockChangePasswordDTO(): { currentPassword: string; newPassword: string } {
    return {
      currentPassword: "password123",
      newPassword: "new-password",
    };
  }
}
