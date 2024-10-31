import { testRequest } from "@e2e/setup";
import { appEnv } from "@providers/config/env";
import { HttpStatus } from "@startup-engine/shared";

describe("Get Google User E2E", () => {
  describe("GET /auth/google/redirect", () => {
    it("should handle successful OAuth redirect", async () => {
      const response = await testRequest.get("/auth/google/redirect").query({
        code: "valid-google-auth-code",
      });

      expect(response.status).toBe(302); // HTTP redirect status
      expect(response.header.location).toContain(appEnv.general.APP_URL);
      expect(response.header.location).toContain("accessToken=");
      expect(response.header.location).toContain("refreshToken=");
    });

    it("should fail without code parameter", async () => {
      const response = await testRequest.get("/auth/google/redirect");

      expect(response.status).toBe(HttpStatus.BadRequest);
      expect(response.body).toEqual({ message: "Authorization code is required" });
    });

    it("should fail with empty code parameter", async () => {
      const response = await testRequest.get("/auth/google/redirect").query({
        code: "",
      });

      expect(response.status).toBe(HttpStatus.BadRequest);
      expect(response.body).toEqual({ message: "Invalid authorization code" });
    });

    it("should fail with invalid code", async () => {
      const response = await testRequest.get("/auth/google/redirect").query({
        code: "invalid-code",
      });

      expect(response.status).toBe(HttpStatus.BadRequest);
      expect(response.body).toEqual({ message: "Failed to authenticate with Google" });
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
      expect(response.header.location).toContain(appEnv.general.APP_URL);
      expect(response.header.location).toContain("errorType=auth");
      expect(response.header.location).toContain("errorMessage=accountAuthFlowMismatch");
    });

    it("should handle returning Google user", async () => {
      // First OAuth login
      const firstResponse = await testRequest.get("/auth/google/redirect").query({
        code: "valid-google-auth-code",
      });

      expect(firstResponse.status).toBe(302); // HTTP redirect status
      expect(firstResponse.header.location).toContain("accessToken=");

      // Second OAuth login with same Google account
      const secondResponse = await testRequest.get("/auth/google/redirect").query({
        code: "valid-google-auth-code",
      });

      expect(secondResponse.status).toBe(302); // HTTP redirect status
      expect(secondResponse.header.location).toContain("accessToken=");
    });

    it("should handle URL-encoded code parameter", async () => {
      const response = await testRequest
        .get("/auth/google/redirect")
        .query({ code: encodeURIComponent("valid-google-auth-code") });

      expect(response.status).toBe(302); // HTTP redirect status
      expect(response.header.location).toContain("accessToken=");
    });

    // Since we're not using method decorators, these requests will return 404
    it("should not accept POST requests", async () => {
      const response = await testRequest.post("/auth/google/redirect").query({
        code: "valid-google-auth-code",
      });

      expect(response.status).toBe(HttpStatus.NotFound);
    });

    it("should not accept PUT requests", async () => {
      const response = await testRequest.put("/auth/google/redirect").query({
        code: "valid-google-auth-code",
      });

      expect(response.status).toBe(HttpStatus.NotFound);
    });

    it("should not accept DELETE requests", async () => {
      const response = await testRequest.delete("/auth/google/redirect").query({
        code: "valid-google-auth-code",
      });

      expect(response.status).toBe(HttpStatus.NotFound);
    });

    it("should not accept PATCH requests", async () => {
      const response = await testRequest.patch("/auth/google/redirect").query({
        code: "valid-google-auth-code",
      });

      expect(response.status).toBe(HttpStatus.NotFound);
    });

    it("should include tokens in redirect URL", async () => {
      const response = await testRequest.get("/auth/google/redirect").query({
        code: "valid-google-auth-code",
      });

      const redirectUrl = new URL(response.header.location);
      expect(redirectUrl.searchParams.has("accessToken")).toBe(true);
      expect(redirectUrl.searchParams.has("refreshToken")).toBe(true);
    });
  });
});
