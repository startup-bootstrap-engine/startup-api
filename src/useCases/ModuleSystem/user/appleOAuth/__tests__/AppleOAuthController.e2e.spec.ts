import { testRequest } from "@e2e/setup";
import { HttpStatus } from "@startup-engine/shared";

describe("Apple OAuth E2E", () => {
  const validAppleOAuthData = {
    user: "apple-user-id-123", // Must match sub in mock token
    identityToken: "valid-identity-token",
    authorizationCode: "valid-auth-code",
    givenName: "John",
    familyName: "Doe",
    email: "test@example.com", // Must match email in mock token
  };

  describe("POST /auth/apple", () => {
    it("should authenticate with all valid fields", async () => {
      const response = await testRequest.post("/auth/apple").send(validAppleOAuthData);

      expect(response.status).toBe(HttpStatus.OK);
      expect(response.body).toHaveProperty("accessToken");
      expect(response.body).toHaveProperty("refreshToken");
    });

    it("should authenticate with only required fields", async () => {
      const { givenName, familyName, ...requiredData } = validAppleOAuthData;
      const response = await testRequest.post("/auth/apple").send(requiredData);

      expect(response.status).toBe(HttpStatus.OK);
      expect(response.body).toHaveProperty("accessToken");
      expect(response.body).toHaveProperty("refreshToken");
    });

    it("should fail without required fields", async () => {
      const testCases = [
        {},
        { user: validAppleOAuthData.user },
        { identityToken: validAppleOAuthData.identityToken },
        { authorizationCode: validAppleOAuthData.authorizationCode },
        { user: validAppleOAuthData.user, identityToken: validAppleOAuthData.identityToken },
        { user: validAppleOAuthData.user, authorizationCode: validAppleOAuthData.authorizationCode },
        { identityToken: validAppleOAuthData.identityToken, authorizationCode: validAppleOAuthData.authorizationCode },
      ];

      const responses = await Promise.all(testCases.map((testCase) => testRequest.post("/auth/apple").send(testCase)));

      responses.forEach((response) => {
        expect(response.status).toBe(HttpStatus.BadRequest);
      });
    });

    it("should fail with invalid field types", async () => {
      const testCases = [
        { ...validAppleOAuthData, user: 123 },
        { ...validAppleOAuthData, identityToken: true },
        { ...validAppleOAuthData, authorizationCode: {} },
        { ...validAppleOAuthData, givenName: 123 },
        { ...validAppleOAuthData, familyName: true },
        { ...validAppleOAuthData, email: [] },
      ];

      const responses = await Promise.all(testCases.map((testCase) => testRequest.post("/auth/apple").send(testCase)));

      responses.forEach((response) => {
        expect(response.status).toBe(HttpStatus.BadRequest);
      });
    });

    it("should fail when user exists with Basic auth flow", async () => {
      // First create a user with Basic auth
      await testRequest.post("/auth/signup").send({
        email: validAppleOAuthData.email,
        password: "password123",
        passwordConfirmation: "password123",
        name: "Test User",
      });

      // Try Apple OAuth with same email
      const response = await testRequest.post("/auth/apple").send(validAppleOAuthData);

      expect(response.status).toBe(HttpStatus.BadRequest);
    });

    it("should fail with invalid identity token", async () => {
      const response = await testRequest.post("/auth/apple").send({
        ...validAppleOAuthData,
        identityToken: "invalid-token",
      });

      expect(response.status).toBe(HttpStatus.BadRequest);
    });

    it("should handle subsequent logins with same Apple ID", async () => {
      // First login
      const firstResponse = await testRequest.post("/auth/apple").send(validAppleOAuthData);
      expect(firstResponse.status).toBe(HttpStatus.OK);

      // Second login with same Apple ID
      const secondResponse = await testRequest.post("/auth/apple").send(validAppleOAuthData);
      expect(secondResponse.status).toBe(HttpStatus.OK);
      expect(secondResponse.body).toHaveProperty("accessToken");
      expect(secondResponse.body).toHaveProperty("refreshToken");
    });

    it("should fail when user ID doesn't match token", async () => {
      const response = await testRequest.post("/auth/apple").send({
        ...validAppleOAuthData,
        user: "different-user-id",
      });

      expect(response.status).toBe(HttpStatus.BadRequest);
    });

    it("should fail when creating new user without email", async () => {
      const response = await testRequest.post("/auth/apple").send({
        ...validAppleOAuthData,
        email: undefined,
      });

      expect(response.status).toBe(HttpStatus.BadRequest);
    });
  });
});
