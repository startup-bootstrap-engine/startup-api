import { jest } from "@jest/globals";
import { EncryptionHelper } from "@providers/auth/EncryptionHelper";
import { appEnv } from "@providers/config/env";
import { container } from "@providers/inversify/container";
import { UnitTestMocker } from "@providers/tests/UnitTestMocker";
import { LogRepository } from "@repositories/ModuleSystem/LogRepository";
import { UserRepository } from "@repositories/ModuleSystem/user/UserRepository";
import { ILog } from "@startup-engine/shared";
import { TransactionalEmail } from "../../../../emails/TransactionalEmail";
import { TransactionalEmailProviders } from "../../../../emails/TransactionalEmailProviders";
import { IEmailProvider } from "../../../../emails/email.types";

const mockEmailProvider: IEmailProvider = {
  key: "TEST_PROVIDER",
  credits: 1000,
  emailSendingFunction: jest.fn(() => Promise.resolve(true)) as unknown as Function,
};

describe("TransactionalEmail", () => {
  let transactionalEmail: TransactionalEmail;
  let unitTestMocker: UnitTestMocker;

  beforeEach(() => {
    transactionalEmail = container.get(TransactionalEmail);
    unitTestMocker = container.get(UnitTestMocker);
    jest.clearAllMocks();
    jest.spyOn(EncryptionHelper.prototype, "encrypt").mockReturnValue("encrypted-email");
    jest.spyOn(TransactionalEmailProviders.prototype, "getProviders").mockReturnValue([mockEmailProvider]);

    // @ts-ignore
    jest.replaceProperty(appEnv.general, "ENV", "Production");

    // @ts-ignore
    jest.spyOn(transactionalEmail, "loadEmailTemplate").mockReturnValue("<html></html>");
  });

  it("should send an email and log the action", async () => {
    const to = "test@example.com";
    const subject = "Test Subject";
    const template = "test-template";
    const customVars = {};

    const mockUser = await unitTestMocker.createMockUser({ unsubscribed: false });

    jest.spyOn(UserRepository.prototype, "findBy").mockResolvedValue(mockUser);
    jest.spyOn(LogRepository.prototype, "createLog").mockResolvedValue({} as ILog);
    jest.spyOn(LogRepository.prototype, "findLogsByAction").mockResolvedValue([]);

    const result = await transactionalEmail.send(to, subject, template, customVars);

    expect(result).toBe(true);
    expect(LogRepository.prototype.createLog).toHaveBeenCalledWith(expect.any(String), expect.any(String), to);
  });

  it("should not send an email if the user is unsubscribed", async () => {
    const to = "test@example.com";
    const subject = "Test Subject";
    const template = "test-template";
    const customVars = {};

    const mockUser = await unitTestMocker.createMockUser({ unsubscribed: true });

    jest.spyOn(UserRepository.prototype, "findBy").mockResolvedValue(mockUser);
    jest.spyOn(LogRepository.prototype, "findLogsByAction").mockResolvedValue([]);

    const result = await transactionalEmail.send(to, subject, template, customVars);

    expect(result).toBe(true);
    expect(LogRepository.prototype.createLog).not.toHaveBeenCalled();
  });

  it("should skip sending email in development environment", async () => {
    const to = "test@example.com";
    const subject = "Test Subject";
    const template = "test-template";
    const customVars = {};

    // @ts-ignore
    jest.replaceProperty(appEnv.general, "ENV", "Development");

    const result = await transactionalEmail.send(to, subject, template, customVars);

    expect(result).toBe(false);
    expect(LogRepository.prototype.createLog).not.toHaveBeenCalled();
  });

  it("should handle email sending failure", async () => {
    const to = "test@example.com";
    const subject = "Test Subject";
    const template = "test-template";
    const customVars = {};

    const mockUser = await unitTestMocker.createMockUser({ unsubscribed: false });

    jest.spyOn(UserRepository.prototype, "findBy").mockResolvedValue(mockUser);
    jest.spyOn(LogRepository.prototype, "findLogsByAction").mockResolvedValue([]);
    // @ts-ignore
    jest.spyOn(mockEmailProvider, "emailSendingFunction").mockResolvedValue(false); // Simulate failure

    const result = await transactionalEmail.send(to, subject, template, customVars);

    expect(result).toBe(false);
    expect(LogRepository.prototype.createLog).not.toHaveBeenCalled();
  });
});
