import { IGenerateAccessTokenResponse } from "@providers/auth/UserAuth";
import { IUser, UserAuthFlow } from "@startup-engine/shared";
import bcrypt from "bcrypt";

interface IChangePasswordDTO {
  currentPassword: string;
  newPassword: string;
}

interface IAuthDTO {
  email: string;
  password: string;
  passwordConfirmation: string;
}

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

  public static createMockTokens(): IGenerateAccessTokenResponse {
    return {
      accessToken: "mock-access-token",
      refreshToken: "mock-refresh-token",
    };
  }

  public static createMockAuthDTO(): IAuthDTO {
    return {
      email: "test@example.com",
      password: "password123",
      passwordConfirmation: "password123",
    };
  }

  public static createMockChangePasswordDTO(): IChangePasswordDTO {
    return {
      currentPassword: "password123",
      newPassword: "new-password",
    };
  }
}
