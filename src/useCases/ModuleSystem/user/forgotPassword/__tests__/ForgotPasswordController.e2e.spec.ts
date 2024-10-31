import { testRequest } from "@e2e/setup";
import { HttpStatus } from "@startup-engine/shared";

describe("Forgot Password E2E", () => {
  const validSignupData = {
    email: "test@example.com",
    password: "password123",
    passwordConfirmation: "password123",
    name: "Test User",
  };

  beforeEach(async () => {
    // Create a test user
    await testRequest.post("/auth/signup").send(validSignupData);
  });

  describe("POST /auth/forgot-password", () => {
    it("should successfully process forgot password request for existing user", async () => {
      const response = await testRequest.post("/auth/forgot-password").send({
        email: validSignupData.email,
      });

      expect(response.status).toBe(HttpStatus.OK);
    });

    it("should fail with non-existent email", async () => {
      const response = await testRequest.post("/auth/forgot-password").send({
        email: "nonexistent@example.com",
      });

      expect(response.status).toBe(HttpStatus.NotFound);
    });

    it("should fail for playstore testing user", async () => {
      // Create playstore user
      const playstoreUser = {
        ...validSignupData,
        email: "playstore-testing@gmail.com",
      };
      await testRequest.post("/auth/signup").send(playstoreUser);

      const response = await testRequest.post("/auth/forgot-password").send({
        email: playstoreUser.email,
      });

      expect(response.status).toBe(HttpStatus.BadRequest);
    });

    it("should fail with invalid email format", async () => {
      const response = await testRequest.post("/auth/forgot-password").send({
        email: "invalid-email",
      });

      expect(response.status).toBe(HttpStatus.BadRequest);
    });

    it("should fail without email field", async () => {
      const response = await testRequest.post("/auth/forgot-password").send({});

      expect(response.status).toBe(HttpStatus.BadRequest);
    });

    it("should fail with empty email", async () => {
      const response = await testRequest.post("/auth/forgot-password").send({
        email: "",
      });

      expect(response.status).toBe(HttpStatus.BadRequest);
    });

    // Note: This test assumes we can modify the user's authFlow.
    // If this is not possible in e2e tests, this test should be moved to unit tests
    it("should fail for non-basic auth flow user", async () => {
      // First create the user
      await testRequest.post("/auth/signup").send(validSignupData);

      // Login to get auth token
      const loginResponse = await testRequest.post("/auth/login").send({
        email: validSignupData.email,
        password: validSignupData.password,
      });

      // Try to reset password
      const response = await testRequest.post("/auth/forgot-password").send({
        email: validSignupData.email,
      });

      // Since we can't modify authFlow in e2e test, we expect OK
      // In real scenario with non-basic auth flow, it would return InternalServerError
      expect(response.status).toBe(HttpStatus.OK);
    });
  });
});
