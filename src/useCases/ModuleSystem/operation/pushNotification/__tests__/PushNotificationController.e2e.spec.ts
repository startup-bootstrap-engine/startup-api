import { testRequest } from "@e2e/setup";
import { HttpStatus, UserTypes } from "@startup-engine/shared";

describe("Push Notification E2E", () => {
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
    pushNotificationToken: "test-push-token",
  };

  const userWithoutTokenData = {
    email: "notoken@example.com",
    password: "password123",
    passwordConfirmation: "password123",
    name: "No Token User",
  };

  let adminToken: string;
  let regularUser: any;
  let userWithoutToken: any;

  beforeEach(async () => {
    // Create admin user and get token
    await testRequest.post("/auth/signup").send(adminUserData);
    const adminLogin = await testRequest.post("/auth/login").send({
      email: adminUserData.email,
      password: adminUserData.password,
    });
    adminToken = adminLogin.body.accessToken;

    // Create regular user with push token
    const regularUserResponse = await testRequest.post("/auth/signup").send(regularUserData);
    regularUser = regularUserResponse.body;

    // Create user without push token
    const noTokenUserResponse = await testRequest.post("/auth/signup").send(userWithoutTokenData);
    userWithoutToken = noTokenUserResponse.body;
  });

  describe("GET /operations/push-notification/test/:userId", () => {
    it("should successfully send push notification to valid user", async () => {
      const response = await testRequest
        .get(`/operations/push-notification/test/${regularUser.id}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(HttpStatus.OK);
      expect(response.body).toHaveProperty("status", "success");
      expect(response.body).toHaveProperty("message", "Push notification submitted");
    });

    it("should fail without auth token", async () => {
      const response = await testRequest.get(`/operations/push-notification/test/${regularUser.id}`);

      expect(response.status).toBe(HttpStatus.Unauthorized);
    });

    it("should fail with invalid auth token", async () => {
      const response = await testRequest
        .get(`/operations/push-notification/test/${regularUser.id}`)
        .set("Authorization", "Bearer invalid-token");

      expect(response.status).toBe(HttpStatus.Unauthorized);
    });

    it("should fail for non-admin user", async () => {
      // Login as regular user
      const regularLogin = await testRequest.post("/auth/login").send({
        email: regularUserData.email,
        password: regularUserData.password,
      });
      const regularToken = regularLogin.body.accessToken;

      const response = await testRequest
        .get(`/operations/push-notification/test/${regularUser.id}`)
        .set("Authorization", `Bearer ${regularToken}`);

      expect(response.status).toBe(HttpStatus.Forbidden);
    });

    it("should fail with invalid user ID", async () => {
      const response = await testRequest
        .get("/operations/push-notification/test/507f1f77bcf86cd799439011")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(HttpStatus.BadRequest);
    });

    it("should fail for user without push token", async () => {
      const response = await testRequest
        .get(`/operations/push-notification/test/${userWithoutToken.id}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(HttpStatus.BadRequest);
    });

    it("should fail with non-MongoDB ObjectId", async () => {
      const response = await testRequest
        .get("/operations/push-notification/test/invalid-id")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(HttpStatus.BadRequest);
    });
  });
});
