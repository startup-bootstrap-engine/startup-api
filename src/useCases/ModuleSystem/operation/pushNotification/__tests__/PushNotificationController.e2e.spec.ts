import { testRequest } from "@e2e/setup";
import { e2eTestMocker } from "@providers/inversify/container";
import { HttpStatus, IUser } from "@startup-engine/shared";
import bcrypt from "bcrypt";

describe("Push Notification E2E", () => {
  let adminUser: IUser;
  let testUser: IUser;
  let adminToken: string;

  beforeEach(async () => {
    const hashPassword = await bcrypt.hash("password123", 10);

    adminUser = await e2eTestMocker.createMockAdminUser({
      email: "admin@example.com",
      name: "Admin User",
      password: hashPassword,
    });

    expect(adminUser).toBeDefined();

    const loginResponse = await testRequest.post("/auth/login").send({
      email: adminUser.email,
      password: "password123",
    });
    adminToken = loginResponse.body.accessToken;

    expect(adminToken).toBeDefined();

    testUser = await e2eTestMocker.createMockUser({
      email: "test@example.com",
      name: "Test User",
      pushNotificationToken: "test-push-token",
    });

    expect(testUser).toBeDefined();
  });

  describe("GET /operations/push-notification/test/:userId", () => {
    it("should send test push notification successfully", async () => {
      const response = await testRequest
        .get(`/operations/push-notification/test/${testUser.id}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(HttpStatus.OK);
      expect(response.body).toEqual({
        status: "success",
        message: "Push notification submitted",
      });
    });

    it("should fail without auth token", async () => {
      const response = await testRequest.get(`/operations/push-notification/test/${testUser.id}`);

      expect(response.status).toBe(HttpStatus.Unauthorized);
    });

    it("should fail with invalid auth token", async () => {
      const response = await testRequest
        .get(`/operations/push-notification/test/${testUser.id}`)
        .set("Authorization", "Bearer invalid-token");

      expect(response.status).toBe(HttpStatus.Unauthorized);
    });
  });
});
