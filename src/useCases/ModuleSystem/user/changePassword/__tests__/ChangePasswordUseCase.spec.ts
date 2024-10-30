import { AnalyticsHelper } from "@providers/analytics/AnalyticsHelper";
import { AuthRefreshToken } from "@providers/auth/AuthRefreshToken";
import { UserAuth } from "@providers/auth/UserAuth";
import { container, unitTestMocker } from "@providers/inversify/container";
import { IUser } from "@startup-engine/shared";
import { TransactionalEmail } from "../../../../../../emails/TransactionalEmail";
import { ChangePasswordUseCase } from "../ChangePasswordUseCase";

describe("ChangePasswordUseCase", () => {
  let changePasswordUseCase: ChangePasswordUseCase;
  let analyticsHelper: AnalyticsHelper;
  let userAuth: UserAuth;
  let transactionalEmail: TransactionalEmail;
  let authRefreshToken: AuthRefreshToken;
  let mockUser: IUser;
  let authRefreshTokenSpy: jest.SpyInstance;
  let analyticsHelperSpy: jest.SpyInstance;
  let transactionalEmailSpy: jest.SpyInstance;
  let userAuthSpy: jest.SpyInstance;

  beforeEach(async () => {
    // Initialize mocks
    mockUser = await unitTestMocker.createMockUser();

    changePasswordUseCase = container.get(ChangePasswordUseCase);
    analyticsHelper = container.get(AnalyticsHelper);
    userAuth = container.get(UserAuth);
    transactionalEmail = container.get(TransactionalEmail);
    authRefreshToken = container.get(AuthRefreshToken);

    // Mock methods using .prototype
    analyticsHelperSpy = jest.spyOn(AnalyticsHelper.prototype, "track").mockResolvedValue();
    transactionalEmailSpy = jest.spyOn(TransactionalEmail.prototype, "send").mockResolvedValue(true);
    userAuthSpy = jest.spyOn(UserAuth.prototype, "recalculatePasswordHash").mockResolvedValue();
    authRefreshTokenSpy = jest.spyOn(AuthRefreshToken.prototype, "invalidateAllRefreshTokens").mockResolvedValue();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it("should change password and invalidate refresh tokens", async () => {
    const dto = unitTestMocker.createMockChangePasswordDTO();

    await changePasswordUseCase.changePassword(mockUser, dto);

    expect(authRefreshTokenSpy).toHaveBeenCalledWith(mockUser.id);
    expect(userAuthSpy).toHaveBeenCalledWith(mockUser);
    expect(transactionalEmailSpy).toHaveBeenCalledWith(
      mockUser.email,
      expect.any(String), // Title
      "notification",
      expect.objectContaining({
        notificationGreetings: expect.any(String),
        notificationMessage: expect.any(String),
        notificationEndPhrase: expect.any(String),
      })
    );
    expect(analyticsHelperSpy).toHaveBeenCalledWith("ChangePassword", mockUser);
  });

  it("should throw error for playstore testing user", async () => {
    const playstoreUser = await unitTestMocker.createMockUser({
      email: "playstore-testing@gmail.com",
    });
    const dto = unitTestMocker.createMockChangePasswordDTO();

    await expect(changePasswordUseCase.changePassword(playstoreUser, dto)).rejects.toThrow(
      "You are not allowed to change the password for this user"
    );
  });

  it("should throw error when passwords are the same", async () => {
    const dto = {
      currentPassword: "password123",
      newPassword: "password123",
    };

    await expect(changePasswordUseCase.changePassword(mockUser, dto)).rejects.toThrow(
      "Your current and new password must be different."
    );
  });

  it("should throw error for incorrect current password", async () => {
    const dto = unitTestMocker.createMockChangePasswordDTO();

    mockUser.password = "incorrect-password";

    await expect(changePasswordUseCase.changePassword(mockUser, dto)).rejects.toThrow(
      "The current password provided is not your password."
    );
  });
});
