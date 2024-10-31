import { testRequest } from "@e2e/setup";
import { HttpStatus, UserTypes } from "@startup-engine/shared";

describe("Premium Account E2E", () => {
  const adminUserData = {
    email: "admin@example.com",
    password: "password123",
    passwordConfirmation: "password123",
    name: "Admin User",
    role: UserTypes.Admin,
  };

  const regularUserData = {
    email: "user@example.com",
    password: "password123",
    passwordConfirmation: "password123",
    name: "Regular User",
  };

  let adminToken: string;
  let regularUserToken: string;

  beforeEach(async () => {
    // Create admin user and get token
    await testRequest.post("/auth/signup").send(adminUserData);
    const adminLogin = await testRequest.post("/auth/login").send({
      email: adminUserData.email,
      password: adminUserData.password,
    });
    adminToken = adminLogin.body.accessToken;

    // Create regular user and get token
    await testRequest.post("/auth/signup").send(regularUserData);
    const userLogin = await testRequest.post("/auth/login").send({
      email: regularUserData.email,
      password: regularUserData.password,
    });
    regularUserToken = userLogin.body.accessToken;
  });

  describe("POST /premium-account/activate", () => {
    const validActivateData = {
      email: "user@example.com",
      accountType: "premium",
    };

    it("should activate premium account successfully", async () => {
      const response = await testRequest
        .post("/premium-account/activate")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(validActivateData);

      expect(response.status).toBe(HttpStatus.OK);
      expect(response.body).toHaveProperty("message", "Premium account activated successfully!");
    });

    it("should fail without auth token", async () => {
      const response = await testRequest.post("/premium-account/activate").send(validActivateData);

      expect(response.status).toBe(HttpStatus.Unauthorized);
    });

    it("should fail with non-admin user", async () => {
      const response = await testRequest
        .post("/premium-account/activate")
        .set("Authorization", `Bearer ${regularUserToken}`)
        .send(validActivateData);

      expect(response.status).toBe(HttpStatus.Forbidden);
    });

    it("should fail with invalid email", async () => {
      const response = await testRequest
        .post("/premium-account/activate")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          ...validActivateData,
          email: "nonexistent@example.com",
        });

      expect(response.status).toBe(HttpStatus.BadRequest);
      expect(response.body).toHaveProperty("message", "User not found!");
    });

    it("should fail without required fields", async () => {
      const responses = await Promise.all([
        testRequest
          .post("/premium-account/activate")
          .set("Authorization", `Bearer ${adminToken}`)
          .send({ email: validActivateData.email }),
        testRequest
          .post("/premium-account/activate")
          .set("Authorization", `Bearer ${adminToken}`)
          .send({ accountType: validActivateData.accountType }),
        testRequest.post("/premium-account/activate").set("Authorization", `Bearer ${adminToken}`).send({}),
      ]);

      responses.forEach((response) => {
        expect(response.status).toBe(HttpStatus.BadRequest);
      });
    });
  });

  describe("POST /premium-account/deactivate", () => {
    const validDeactivateData = {
      email: "user@example.com",
    };

    beforeEach(async () => {
      // Activate premium account first
      await testRequest.post("/premium-account/activate").set("Authorization", `Bearer ${adminToken}`).send({
        email: validDeactivateData.email,
        accountType: "premium",
      });
    });

    it("should deactivate premium account successfully", async () => {
      const response = await testRequest
        .post("/premium-account/deactivate")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(validDeactivateData);

      expect(response.status).toBe(HttpStatus.OK);
      expect(response.body).toHaveProperty("message", "Premium account deactivated successfully!");
    });

    it("should fail without auth token", async () => {
      const response = await testRequest.post("/premium-account/deactivate").send(validDeactivateData);

      expect(response.status).toBe(HttpStatus.Unauthorized);
    });

    it("should fail with non-admin user", async () => {
      const response = await testRequest
        .post("/premium-account/deactivate")
        .set("Authorization", `Bearer ${regularUserToken}`)
        .send(validDeactivateData);

      expect(response.status).toBe(HttpStatus.Forbidden);
    });

    it("should fail with invalid email", async () => {
      const response = await testRequest
        .post("/premium-account/deactivate")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          email: "nonexistent@example.com",
        });

      expect(response.status).toBe(HttpStatus.BadRequest);
      expect(response.body).toHaveProperty("message", "User not found!");
    });

    it("should fail without email", async () => {
      const response = await testRequest
        .post("/premium-account/deactivate")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({});

      expect(response.status).toBe(HttpStatus.BadRequest);
    });

    it("should handle deactivating already deactivated account", async () => {
      // First deactivation
      await testRequest
        .post("/premium-account/deactivate")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(validDeactivateData);

      // Second deactivation
      const response = await testRequest
        .post("/premium-account/deactivate")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(validDeactivateData);

      expect(response.status).toBe(HttpStatus.BadRequest);
      expect(response.body).toHaveProperty("message", "Error deactivating premium account!");
    });
  });
});
