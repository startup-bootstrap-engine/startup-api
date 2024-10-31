import { testRequest } from "@e2e/setup";
import { HttpStatus, UserTypes } from "@startup-engine/shared";

describe("Scripts E2E", () => {
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

  describe("Base /scripts route", () => {
    it("should require authentication", async () => {
      const response = await testRequest.get("/scripts");

      expect(response.status).toBe(HttpStatus.Unauthorized);
    });

    it("should fail with invalid auth token", async () => {
      const response = await testRequest.get("/scripts").set("Authorization", "Bearer invalid-token");

      expect(response.status).toBe(HttpStatus.Unauthorized);
    });

    it("should require admin role", async () => {
      const response = await testRequest.get("/scripts").set("Authorization", `Bearer ${regularUserToken}`);

      expect(response.status).toBe(HttpStatus.Forbidden);
    });

    it("should allow admin access", async () => {
      const response = await testRequest.get("/scripts").set("Authorization", `Bearer ${adminToken}`);

      // Since no endpoint is defined, expect 404
      expect(response.status).toBe(HttpStatus.NotFound);
    });

    it("should not allow POST requests", async () => {
      const response = await testRequest.post("/scripts").set("Authorization", `Bearer ${adminToken}`).send({});

      expect(response.status).toBe(HttpStatus.NotFound);
    });

    it("should not allow PUT requests", async () => {
      const response = await testRequest.put("/scripts").set("Authorization", `Bearer ${adminToken}`).send({});

      expect(response.status).toBe(HttpStatus.NotFound);
    });

    it("should not allow DELETE requests", async () => {
      const response = await testRequest.delete("/scripts").set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(HttpStatus.NotFound);
    });

    it("should not allow PATCH requests", async () => {
      const response = await testRequest.patch("/scripts").set("Authorization", `Bearer ${adminToken}`).send({});

      expect(response.status).toBe(HttpStatus.NotFound);
    });
  });
});
