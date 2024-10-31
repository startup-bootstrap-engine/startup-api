import { testRequest } from "@e2e/setup";
import { HttpStatus } from "@startup-engine/shared";

describe("Google OAuth Sync E2E", () => {
  const validGoogleOAuthData = {
    idToken: "valid-google-id-token",
  };

  describe("POST /auth/google/mobile", () => {
    it("should authenticate with valid ID token", async () => {
      const response = await testRequest.post("/auth/google/mobile").send(validGoogleOAuthData);

      expect(response.status).toBe(HttpStatus.OK);
      expect(response.body).toHaveProperty("accessToken");
      expect(response.body).toHaveProperty("refreshToken");
    });

    it("should fail without ID token", async () => {
      const response = await testRequest.post("/auth/google/mobile").send({});

      expect(response.status).toBe(HttpStatus.BadRequest);
    });

    it("should fail with empty ID token", async () => {
      const response = await testRequest.post("/auth/google/mobile").send({
        idToken: "",
      });

      expect(response.status).toBe(HttpStatus.BadRequest);
    });

    it("should fail with invalid ID token", async () => {
      const response = await testRequest.post("/auth/google/mobile").send({
        idToken: "invalid-token",
      });

      expect(response.status).toBe(HttpStatus.BadRequest);
    });

    it("should fail when user exists with Basic auth flow", async () => {
      // First create a user with Basic auth
      await testRequest.post("/auth/signup").send({
        email: "test@example.com", // Must match email in mock token
        password: "password123",
        passwordConfirmation: "password123",
        name: "Test User",
      });

      // Try Google OAuth with same email
      const response = await testRequest.post("/auth/google/mobile").send(validGoogleOAuthData);

      expect(response.status).toBe(HttpStatus.BadRequest);
    });

    it("should handle subsequent logins with same Google ID", async () => {
      // First login
      const firstResponse = await testRequest.post("/auth/google/mobile").send(validGoogleOAuthData);
      expect(firstResponse.status).toBe(HttpStatus.OK);

      // Second login with same Google ID
      const secondResponse = await testRequest.post("/auth/google/mobile").send(validGoogleOAuthData);
      expect(secondResponse.status).toBe(HttpStatus.OK);
      expect(secondResponse.body).toHaveProperty("accessToken");
      expect(secondResponse.body).toHaveProperty("refreshToken");
    });

    it("should fail with malformed ID token", async () => {
      const response = await testRequest.post("/auth/google/mobile").send({
        idToken: { invalid: "object" },
      });

      expect(response.status).toBe(HttpStatus.BadRequest);
    });

    it("should fail when ID token validation fails", async () => {
      const response = await testRequest.post("/auth/google/mobile").send({
        idToken: "invalid-signature-token",
      });

      expect(response.status).toBe(HttpStatus.BadRequest);
    });

    it("should fail when unable to get user info from token", async () => {
      const response = await testRequest.post("/auth/google/mobile").send({
        idToken: "valid-but-no-user-info-token",
      });

      expect(response.status).toBe(HttpStatus.BadRequest);
    });

    it("should handle non-string ID token", async () => {
      const responses = await Promise.all([
        testRequest.post("/auth/google/mobile").send({ idToken: 123 }),
        testRequest.post("/auth/google/mobile").send({ idToken: true }),
        testRequest.post("/auth/google/mobile").send({ idToken: null }),
        testRequest.post("/auth/google/mobile").send({ idToken: undefined }),
      ]);

      responses.forEach((response) => {
        expect(response.status).toBe(HttpStatus.BadRequest);
      });
    });
  });

  describe("GET /auth/google/redirect", () => {
    it("should handle successful OAuth redirect", async () => {
      const response = await testRequest.get("/auth/google/redirect").query({
        code: "valid-google-auth-code",
      });

      expect(response.status).toBe(302); // HTTP redirect status
      expect(response.header.location).toContain("accessToken=");
      expect(response.header.location).toContain("refreshToken=");
    });

    it("should fail without code parameter", async () => {
      const response = await testRequest.get("/auth/google/redirect");

      expect(response.status).toBe(HttpStatus.BadRequest);
    });

    it("should fail with invalid code", async () => {
      const response = await testRequest.get("/auth/google/redirect").query({
        code: "invalid-code",
      });

      expect(response.status).toBe(HttpStatus.InternalServerError);
    });

    it("should redirect with error for Basic auth flow conflict", async () => {
      // First create a user with Basic auth
      await testRequest.post("/auth/signup").send({
        email: "test@example.com", // Must match email in mock token
        password: "password123",
        passwordConfirmation: "password123",
        name: "Test User",
      });

      // Try Google OAuth with same email
      const response = await testRequest.get("/auth/google/redirect").query({
        code: "valid-google-auth-code",
      });

      expect(response.status).toBe(302); // HTTP redirect status
      expect(response.header.location).toContain("errorType=auth");
      expect(response.header.location).toContain("errorMessage=accountAuthFlowMismatch");
    });

    it("should handle URL-encoded code parameter", async () => {
      const response = await testRequest
        .get("/auth/google/redirect")
        .query({ code: encodeURIComponent("valid-google-auth-code") });

      expect(response.status).toBe(302); // HTTP redirect status
      expect(response.header.location).toContain("accessToken=");
    });
  });
});
