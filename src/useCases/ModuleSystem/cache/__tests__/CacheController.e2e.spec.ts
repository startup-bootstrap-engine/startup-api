import { testRequest } from "@e2e/setup";
import { HttpStatus, UserTypes } from "@startup-engine/shared";

describe("Cache E2E", () => {
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
    role: UserTypes.Regular,
  };

  let adminToken: string;
  let userToken: string;

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
    userToken = userLogin.body.accessToken;
  });

  describe("GET /cache/purge", () => {
    it("should successfully purge cache for admin user", async () => {
      const response = await testRequest.get("/cache/purge").set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(HttpStatus.OK);
      expect(response.body).toHaveProperty("message", "Cache purged");
    });

    it("should fail without auth token", async () => {
      const response = await testRequest.get("/cache/purge");

      expect(response.status).toBe(HttpStatus.Unauthorized);
    });

    it("should fail with invalid auth token", async () => {
      const response = await testRequest.get("/cache/purge").set("Authorization", "Bearer invalid-token");

      expect(response.status).toBe(HttpStatus.Unauthorized);
    });

    it("should fail for non-admin user", async () => {
      const response = await testRequest.get("/cache/purge").set("Authorization", `Bearer ${userToken}`);

      expect(response.status).toBe(HttpStatus.Unauthorized);
    });

    it("should be idempotent for admin user", async () => {
      // First purge
      const firstResponse = await testRequest.get("/cache/purge").set("Authorization", `Bearer ${adminToken}`);
      expect(firstResponse.status).toBe(HttpStatus.OK);

      // Second purge
      const secondResponse = await testRequest.get("/cache/purge").set("Authorization", `Bearer ${adminToken}`);
      expect(secondResponse.status).toBe(HttpStatus.OK);
      expect(secondResponse.body).toEqual(firstResponse.body);
    });
  });
});
