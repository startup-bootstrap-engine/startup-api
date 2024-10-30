import { appEnv } from "@providers/config/env";
import { InternalServerError } from "@providers/errors/InternalServerError";
import { NotFoundError } from "@providers/errors/NotFoundError";
import { container, unitTestMocker } from "@providers/inversify/container";
import { IntegrationTestMocker } from "@providers/tests/IntegrationMocker";
import { UserRepository } from "@repositories/ModuleSystem/user/UserRepository";
import { IUser, UserAuthFlow } from "@startup-engine/shared";
import bcrypt from "bcrypt";
import { AuthRefreshToken } from "../AuthRefreshToken";
import { UserAuth } from "../UserAuth";

describe("UserAuth", () => {
  let userAuth: UserAuth;
  let userRepository: UserRepository;
  let authRefreshToken: AuthRefreshToken;
  let integrationTestHelper: IntegrationTestMocker;
  let mockUser: IUser;
  let generateRefreshTokenSpy: jest.SpyInstance;
  let addRefreshTokenSpy: jest.SpyInstance;

  beforeEach(async () => {
    userAuth = container.get(UserAuth);
    userRepository = container.get(UserRepository);

    mockUser = await unitTestMocker.createMockUser();

    generateRefreshTokenSpy = jest
      .spyOn(AuthRefreshToken.prototype, "generateRefreshToken")
      .mockReturnValue("mockRefreshToken");
    addRefreshTokenSpy = jest.spyOn(AuthRefreshToken.prototype, "addRefreshToken").mockResolvedValue();
  });

  describe("isValidPassword", () => {
    it("should return true when password matches", async () => {
      const result = await userAuth.isValidPassword("password123", mockUser);
      expect(result).toBe(true);
    });

    it("should return false when password does not match", async () => {
      jest.spyOn(bcrypt, "hash").mockResolvedValueOnce("differentHash");
      const result = await userAuth.isValidPassword("testPassword", mockUser);
      expect(result).toBe(false);
    });
  });

  describe("generateAccessToken", () => {
    it("should generate access and refresh tokens", async () => {
      const result = await userAuth.generateAccessToken(mockUser);

      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();

      expect(generateRefreshTokenSpy).toHaveBeenCalledWith(mockUser);
      expect(addRefreshTokenSpy).toHaveBeenCalledWith(mockUser, result.refreshToken);
    });

    it("should throw error if user is not provided", async () => {
      await expect(userAuth.generateAccessToken(null as unknown as IUser)).rejects.toThrow(InternalServerError);
    });

    it("should throw error if JWT_SECRET is not set", async () => {
      const originalSecret = appEnv.authentication.JWT_SECRET;
      appEnv.authentication.JWT_SECRET = undefined;

      await expect(userAuth.generateAccessToken(mockUser)).rejects.toThrow(InternalServerError);

      appEnv.authentication.JWT_SECRET = originalSecret;
    });
  });

  describe("refreshToken", () => {
    it("should refresh tokens successfully", async () => {
      const verifyRefreshTokenSpy = jest
        .spyOn(AuthRefreshToken.prototype, "verifyRefreshToken")
        .mockResolvedValue(mockUser);
      const removeRefreshTokenSpy = jest.spyOn(AuthRefreshToken.prototype, "removeRefreshToken").mockResolvedValue();

      const result = await userAuth.refreshToken("oldRefreshToken");

      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();

      expect(verifyRefreshTokenSpy).toHaveBeenCalledWith("oldRefreshToken");
      expect(removeRefreshTokenSpy).toHaveBeenCalledWith(mockUser, "oldRefreshToken");
    });
  });

  describe("checkIfExists", () => {
    it("should return true when user exists", async () => {
      jest.spyOn(UserRepository.prototype, "exists").mockResolvedValue(true);
      const result = await userAuth.checkIfExists("test@example.com");
      expect(result).toBe(true);
      expect(userRepository.exists).toHaveBeenCalledWith({ email: "test@example.com" });
    });

    it("should return false when user does not exist", async () => {
      jest.spyOn(UserRepository.prototype, "exists").mockResolvedValue(false);
      const result = await userAuth.checkIfExists("test@example.com");
      expect(result).toBe(false);
    });
  });

  describe("findByCredentials", () => {
    it("should return user when credentials are valid", async () => {
      jest.spyOn(UserRepository.prototype, "findBy").mockResolvedValue(mockUser);
      jest.spyOn(userAuth, "isValidPassword").mockResolvedValue(true);

      const result = await userAuth.findByCredentials("test@example.com", "password");

      expect(result).toEqual(mockUser);
      expect(userRepository.findBy).toHaveBeenCalledWith({ email: "test@example.com" });
    });

    it("should return null when password is invalid", async () => {
      jest.spyOn(UserRepository.prototype, "findBy").mockResolvedValue(mockUser);
      jest.spyOn(userAuth, "isValidPassword").mockResolvedValue(false);

      const result = await userAuth.findByCredentials("test@example.com", "wrongpassword");

      expect(result).toBeNull();
    });

    it("should throw NotFoundError when user does not exist", async () => {
      jest.spyOn(UserRepository.prototype, "findBy").mockResolvedValue(null);

      await expect(userAuth.findByCredentials("test@example.com", "password")).rejects.toThrow(NotFoundError);
    });

    it("should throw error when auth flow is not Basic", async () => {
      const googleUser = await unitTestMocker.createMockUser({
        authFlow: UserAuthFlow.GoogleOAuth,
      });
      jest.spyOn(UserRepository.prototype, "findBy").mockResolvedValue(googleUser);

      await expect(userAuth.findByCredentials("test@example.com", "password")).rejects.toThrow(InternalServerError);
    });
  });

  describe("recalculatePasswordHash", () => {
    it("should update user password with new hash", async () => {
      const bcryptGenSaltSpy = jest.spyOn(bcrypt, "genSalt").mockResolvedValue("newSalt");
      const bcryptHashSpy = jest.spyOn(bcrypt, "hash").mockResolvedValue("hashed_password");

      jest.spyOn(UserRepository.prototype, "updateById").mockResolvedValue(mockUser);

      await userAuth.recalculatePasswordHash(mockUser);

      expect(bcryptGenSaltSpy).toHaveBeenCalled();
      expect(bcryptHashSpy).toHaveBeenCalledWith(mockUser.password, "newSalt");
      expect(userRepository.updateById).toHaveBeenCalledWith(mockUser._id, {
        email: mockUser.email,
        password: "hashed_password",
        salt: "newSalt",
      });
    });

    it("should throw error when email is not found", async () => {
      const userWithoutEmail = { ...mockUser, email: undefined };

      await expect(userAuth.recalculatePasswordHash(userWithoutEmail)).rejects.toThrow(InternalServerError);
    });
  });
});
