import { appEnv } from "@providers/config/env";
import { container, unitTestMocker } from "@providers/inversify/container";
import { UserRepository } from "@repositories/ModuleSystem/user/UserRepository";
import { IUser } from "@startup-engine/shared";
import jwt from "jsonwebtoken";
import { AuthRefreshToken } from "../AuthRefreshToken";

describe("AuthRefreshToken", () => {
  let authRefreshToken: AuthRefreshToken;
  let mockUser: IUser;

  beforeEach(async () => {
    authRefreshToken = container.get(AuthRefreshToken);
    mockUser = await unitTestMocker.createMockUser();
  });

  describe("generateRefreshToken", () => {
    it("should generate a valid refresh token", async () => {
      const token = await authRefreshToken.generateRefreshToken(mockUser);

      const decoded = jwt.verify(token, appEnv.authentication.REFRESH_TOKEN_SECRET!) as any;
      expect(decoded.id).toBe(mockUser.id);
      expect(decoded.email).toBe(mockUser.email);
    });
  });

  describe("addRefreshToken", () => {
    it("should add a refresh token to user's tokens", async () => {
      const token = "mock-refresh-token";
      jest.spyOn(UserRepository.prototype, "updateById").mockResolvedValueOnce(mockUser);

      await authRefreshToken.addRefreshToken(mockUser, token);

      expect(UserRepository.prototype.updateById).toHaveBeenCalledWith(mockUser.id, {
        refreshTokens: [{ token }],
      });
    });
  });

  describe("removeRefreshToken", () => {
    it("should remove a specific refresh token", async () => {
      const token = "token-to-remove";
      const mockUserWithToken = await unitTestMocker.createMockUser({
        refreshTokens: [{ token }, { token: "other-token" }],
      });

      jest.spyOn(UserRepository.prototype, "updateById").mockResolvedValueOnce(mockUser);

      await authRefreshToken.removeRefreshToken(mockUserWithToken, token);

      expect(UserRepository.prototype.updateById).toHaveBeenCalledWith(mockUserWithToken.id, {
        refreshTokens: [{ token: "other-token" }],
      });
    });
  });

  describe("invalidateAllRefreshTokens", () => {
    it("should remove all refresh tokens", async () => {
      jest.spyOn(UserRepository.prototype, "updateById").mockResolvedValueOnce(mockUser);

      await authRefreshToken.invalidateAllRefreshTokens(mockUser.id);

      expect(UserRepository.prototype.updateById).toHaveBeenCalledWith(mockUser.id, {
        refreshTokens: [],
      });
    });
  });

  describe("verifyRefreshToken", () => {
    it("should verify and return user for valid token", async () => {
      const token = authRefreshToken.generateRefreshToken(mockUser);
      const mockUserWithToken = await unitTestMocker.createMockUser({
        refreshTokens: [{ token }],
      });

      jest.spyOn(UserRepository.prototype, "findById").mockResolvedValueOnce(mockUserWithToken);

      const result = await authRefreshToken.verifyRefreshToken(token);

      expect(result).toEqual(mockUserWithToken);
    });

    it("should throw error for invalid token", async () => {
      const invalidToken = "invalid-token";

      await expect(authRefreshToken.verifyRefreshToken(invalidToken)).rejects.toThrow("Invalid refresh token");
    });

    it("should throw error when user not found", async () => {
      const token = authRefreshToken.generateRefreshToken(mockUser);

      jest.spyOn(UserRepository.prototype, "findById").mockResolvedValueOnce(null);

      await expect(authRefreshToken.verifyRefreshToken(token)).rejects.toThrow("User does not exist!");
    });

    it("should throw error when token not in user's refresh tokens", async () => {
      const token = authRefreshToken.generateRefreshToken(mockUser);
      const mockUserWithoutToken = await unitTestMocker.createMockUser();

      jest.spyOn(UserRepository.prototype, "findById").mockResolvedValueOnce(mockUserWithoutToken);

      await expect(authRefreshToken.verifyRefreshToken(token)).rejects.toThrow("Invalid refresh token");
    });
  });
});
