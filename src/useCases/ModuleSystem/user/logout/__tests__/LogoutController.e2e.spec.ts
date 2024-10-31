import { testRequest } from "@e2e/setup";
import { HttpStatus } from "@startup-engine/shared";

describe("Logout E2E", () => {
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

  describe("POST /auth/logout", () => {
    it("should successfully logout with valid tokens", async () => {
      const response = await testRequest
        .post("/auth/logout")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ refreshToken });

      expect(response.status).toBe(HttpStatus.OK);

      // Verify refresh token is invalidated by trying to use it
      const refreshResponse = await testRequest.post("/auth/refresh-token").send({ refreshToken });
      expect(refreshResponse.status).toBe(HttpStatus.Unauthorized);
    });

    it("should fail without auth token", async () => {
      const response = await testRequest.post("/auth/logout").send({ refreshToken });

      expect(response.status).toBe(HttpStatus.Unauthorized);
    });

    it("should fail with invalid auth token", async () => {
      const response = await testRequest
        .post("/auth/logout")
        .set("Authorization", "Bearer invalid-token")
        .send({ refreshToken });

      expect(response.status).toBe(HttpStatus.Unauthorized);
    });

    it("should succeed with invalid refresh token", async () => {
      // Should still return OK even with invalid refresh token since we're just filtering it out
      const response = await testRequest
        .post("/auth/logout")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ refreshToken: "invalid-refresh-token" });

      expect(response.status).toBe(HttpStatus.OK);
    });

    it("should allow multiple logouts with different refresh tokens", async () => {
      // Login again to get a second refresh token
      const secondLoginResponse = await testRequest.post("/auth/login").send({
        email: validSignupData.email,
        password: validSignupData.password,
      });

      const secondRefreshToken = secondLoginResponse.body.refreshToken;

      // Logout with first token
      const firstLogoutResponse = await testRequest
        .post("/auth/logout")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ refreshToken });

      expect(firstLogoutResponse.status).toBe(HttpStatus.OK);

      // Logout with second token
      const secondLogoutResponse = await testRequest
        .post("/auth/logout")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ refreshToken: secondRefreshToken });

      expect(secondLogoutResponse.status).toBe(HttpStatus.OK);
    });
  });
});
