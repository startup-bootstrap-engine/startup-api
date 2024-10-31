import { testRequest } from "@e2e/setup";
import { HttpStatus } from "@startup-engine/shared";

describe("Refresh Token E2E", () => {
  const validSignupData = {
    email: "test@example.com",
    password: "password123",
    passwordConfirmation: "password123",
    name: "Test User",
  };

  let authToken: string;
  let refreshToken: string;

  beforeEach(async () => {
    // Create a test user
    await testRequest.post("/auth/signup").send(validSignupData);

    // Login to get auth token and refresh token
    const loginResponse = await testRequest.post("/auth/login").send({
      email: validSignupData.email,
      password: validSignupData.password,
    });

    authToken = loginResponse.body.accessToken;
    refreshToken = loginResponse.body.refreshToken;
  });

  describe("POST /auth/refresh-token", () => {
    it("should successfully refresh token with valid tokens", async () => {
      const response = await testRequest
        .post("/auth/refresh-token")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ refreshToken });

      expect(response.status).toBe(HttpStatus.OK);
      expect(response.body).toHaveProperty("accessToken");
      expect(typeof response.body.accessToken).toBe("string");
      expect(response.body.accessToken).not.toBe(authToken); // New token should be different
    });

    it("should fail without auth token", async () => {
      const response = await testRequest.post("/auth/refresh-token").send({ refreshToken });

      expect(response.status).toBe(HttpStatus.Unauthorized);
    });

    it("should fail with invalid auth token", async () => {
      const response = await testRequest
        .post("/auth/refresh-token")
        .set("Authorization", "Bearer invalid-token")
        .send({ refreshToken });

      expect(response.status).toBe(HttpStatus.Unauthorized);
    });

    it("should fail without refresh token", async () => {
      const response = await testRequest
        .post("/auth/refresh-token")
        .set("Authorization", `Bearer ${authToken}`)
        .send({});

      expect(response.status).toBe(HttpStatus.BadRequest);
    });

    it("should fail with empty refresh token", async () => {
      const response = await testRequest
        .post("/auth/refresh-token")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ refreshToken: "" });

      expect(response.status).toBe(HttpStatus.BadRequest);
    });

    it("should fail with invalid refresh token", async () => {
      const response = await testRequest
        .post("/auth/refresh-token")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ refreshToken: "invalid-refresh-token" });

      expect(response.status).toBe(HttpStatus.BadRequest);
    });

    it("should fail with refresh token after logout", async () => {
      // First logout
      await testRequest.post("/auth/logout").set("Authorization", `Bearer ${authToken}`).send({ refreshToken });

      // Then try to refresh with the same token
      const response = await testRequest
        .post("/auth/refresh-token")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ refreshToken });

      expect(response.status).toBe(HttpStatus.BadRequest);
    });

    it("should allow multiple refresh token requests", async () => {
      // First refresh
      const firstResponse = await testRequest
        .post("/auth/refresh-token")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ refreshToken });

      expect(firstResponse.status).toBe(HttpStatus.OK);
      const newAuthToken = firstResponse.body.accessToken;

      // Second refresh using new auth token
      const secondResponse = await testRequest
        .post("/auth/refresh-token")
        .set("Authorization", `Bearer ${newAuthToken}`)
        .send({ refreshToken });

      expect(secondResponse.status).toBe(HttpStatus.OK);
      expect(secondResponse.body.accessToken).not.toBe(newAuthToken); // Should get another new token
    });

    it("should work with new auth token but same refresh token", async () => {
      // Get new auth token
      const refreshResponse = await testRequest
        .post("/auth/refresh-token")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ refreshToken });

      const newAuthToken = refreshResponse.body.accessToken;

      // Use new auth token with original refresh token
      const secondResponse = await testRequest
        .post("/auth/refresh-token")
        .set("Authorization", `Bearer ${newAuthToken}`)
        .send({ refreshToken });

      expect(secondResponse.status).toBe(HttpStatus.OK);
      expect(secondResponse.body).toHaveProperty("accessToken");
    });
  });
});
