import { testRequest } from "@e2e/setup";
import { AccountTypeEnum } from "@prisma/client";
import { e2eTestMocker } from "@providers/inversify/container";
import { HttpStatus, IUser } from "@startup-engine/shared";
import bcrypt from "bcrypt";
describe("Premium Account E2E", () => {
  let adminUser: IUser;
  let testUser: IUser;
  let adminToken: string;

  beforeEach(async () => {
    // Create admin user

    const hashPassword = await bcrypt.hash("password123", 10);

    adminUser = await e2eTestMocker.createMockAdminUser({
      email: "admin@example.com",
      name: "Admin User",
      password: hashPassword,
    });

    expect(adminUser).toBeDefined();

    // Get admin token
    const loginResponse = await testRequest.post("/auth/login").send({
      email: adminUser.email,
      password: "password123",
    });
    adminToken = loginResponse.body.accessToken;

    expect(adminToken).toBeDefined();

    // Create test user
    testUser = await e2eTestMocker.createMockUser({
      email: "test@example.com",
      name: "Test User",
    });

    expect(testUser).toBeDefined();
  });

  describe("POST /premium-account/activate", () => {
    it("should activate premium account successfully", async () => {
      const response = await testRequest
        .post("/premium-account/activate")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          email: testUser.email,
          accountType: AccountTypeEnum.ultimate,
        });

      expect(response).toBeDefined();

      expect(response.status).toBe(HttpStatus.OK);
      expect(response.body).toEqual({
        message: "Premium account activated successfully!",
      });
    });

    it("should fail without auth token", async () => {
      const response = await testRequest.post("/premium-account/activate").send({
        email: testUser.email,
        accountType: "premium",
      });

      expect(response.status).toBe(HttpStatus.Unauthorized);
    });

    it("should fail with invalid auth token", async () => {
      const response = await testRequest
        .post("/premium-account/activate")
        .set("Authorization", "Bearer invalid-token")
        .send({
          email: testUser.email,
          accountType: "premium",
        });

      expect(response.status).toBe(HttpStatus.Unauthorized);
    });

    it("should fail when user not found", async () => {
      const response = await testRequest
        .post("/premium-account/activate")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          email: "nonexistent@example.com",
          accountType: "premium",
        });

      expect(response.status).toBe(HttpStatus.BadRequest);
      expect(response.body).toEqual({
        error: "User not found!",
      });
    });

    it("should fail without required fields", async () => {
      const testCases = [{}, { email: testUser.email }, { accountType: "premium" }];

      const responses = await Promise.all(
        testCases.map((testCase) =>
          testRequest.post("/premium-account/activate").set("Authorization", `Bearer ${adminToken}`).send(testCase)
        )
      );

      responses.forEach((response) => {
        expect(response.status).toBe(HttpStatus.BadRequest);
      });
    });
  });

  describe("POST /premium-account/deactivate", () => {
    beforeEach(async () => {
      // Activate premium account first
      await testRequest.post("/premium-account/activate").set("Authorization", `Bearer ${adminToken}`).send({
        email: testUser.email,
        accountType: "premium",
      });
    });

    it("should deactivate premium account successfully", async () => {
      const response = await testRequest
        .post("/premium-account/deactivate")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          email: testUser.email,
        });

      expect(response.status).toBe(HttpStatus.OK);
      expect(response.body).toEqual({
        message: "Premium account deactivated successfully!",
      });
    });

    it("should fail without auth token", async () => {
      const response = await testRequest.post("/premium-account/deactivate").send({
        email: testUser.email,
      });

      expect(response.status).toBe(HttpStatus.Unauthorized);
    });

    it("should fail with invalid auth token", async () => {
      const response = await testRequest
        .post("/premium-account/deactivate")
        .set("Authorization", "Bearer invalid-token")
        .send({
          email: testUser.email,
        });

      expect(response.status).toBe(HttpStatus.Unauthorized);
    });

    it("should fail when user not found", async () => {
      const response = await testRequest
        .post("/premium-account/deactivate")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          email: "nonexistent@example.com",
        });

      expect(response.status).toBe(HttpStatus.BadRequest);
      expect(response.body).toEqual({
        error: "User not found!",
      });
    });

    it("should fail without email field", async () => {
      const response = await testRequest
        .post("/premium-account/deactivate")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({});

      expect(response.status).toBe(HttpStatus.BadRequest);
    });
  });
});
