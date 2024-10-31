import { testRequest } from "@e2e/setup";
import { HttpStatus } from "@startup-engine/shared";

describe("Generate Google OAuth URL E2E", () => {
  describe("GET /auth/google/url", () => {
    it("should return Google OAuth URL", async () => {
      const response = await testRequest.get("/auth/google/url");

      expect(response.status).toBe(HttpStatus.OK);
      expect(response.body).toHaveProperty("googleOAuthUrl");
      expect(typeof response.body.googleOAuthUrl).toBe("string");
    });

    it("should return URL with required OAuth parameters", async () => {
      const response = await testRequest.get("/auth/google/url");
      const url = new URL(response.body.googleOAuthUrl);

      expect(url.origin).toBe("https://accounts.google.com");
      expect(url.pathname).toBe("/o/oauth2/v2/auth");

      // Check required OAuth parameters
      expect(url.searchParams.has("client_id")).toBe(true);
      expect(url.searchParams.has("redirect_uri")).toBe(true);
      expect(url.searchParams.has("response_type")).toBe(true);
      expect(url.searchParams.has("scope")).toBe(true);
      expect(url.searchParams.has("access_type")).toBe(true);
      expect(url.searchParams.has("prompt")).toBe(true);

      // Check parameter values
      expect(url.searchParams.get("response_type")).toBe("code");
      expect(url.searchParams.get("access_type")).toBe("offline");
      expect(url.searchParams.get("prompt")).toBe("consent");
      expect(url.searchParams.get("scope")).toContain("profile");
      expect(url.searchParams.get("scope")).toContain("email");
    });

    it("should return same URL structure on subsequent requests", async () => {
      const firstResponse = await testRequest.get("/auth/google/url");
      const secondResponse = await testRequest.get("/auth/google/url");

      const firstUrl = new URL(firstResponse.body.googleOAuthUrl);
      const secondUrl = new URL(secondResponse.body.googleOAuthUrl);

      // Compare URL components
      expect(firstUrl.origin).toBe(secondUrl.origin);
      expect(firstUrl.pathname).toBe(secondUrl.pathname);
      expect(firstUrl.searchParams.get("client_id")).toBe(secondUrl.searchParams.get("client_id"));
      expect(firstUrl.searchParams.get("redirect_uri")).toBe(secondUrl.searchParams.get("redirect_uri"));
      expect(firstUrl.searchParams.get("response_type")).toBe(secondUrl.searchParams.get("response_type"));
      expect(firstUrl.searchParams.get("scope")).toBe(secondUrl.searchParams.get("scope"));
      expect(firstUrl.searchParams.get("access_type")).toBe(secondUrl.searchParams.get("access_type"));
      expect(firstUrl.searchParams.get("prompt")).toBe(secondUrl.searchParams.get("prompt"));
    });

    it("should not accept POST requests", async () => {
      const response = await testRequest.post("/auth/google/url");

      expect(response.status).toBe(HttpStatus.MethodNotAllowed);
    });

    it("should not accept PUT requests", async () => {
      const response = await testRequest.put("/auth/google/url");

      expect(response.status).toBe(HttpStatus.MethodNotAllowed);
    });

    it("should not accept DELETE requests", async () => {
      const response = await testRequest.delete("/auth/google/url");

      expect(response.status).toBe(HttpStatus.MethodNotAllowed);
    });

    it("should not accept PATCH requests", async () => {
      const response = await testRequest.patch("/auth/google/url");

      expect(response.status).toBe(HttpStatus.MethodNotAllowed);
    });

    it("should return HTTPS URL", async () => {
      const response = await testRequest.get("/auth/google/url");
      const url = new URL(response.body.googleOAuthUrl);

      expect(url.protocol).toBe("https:");
    });

    it("should return Google domain URL", async () => {
      const response = await testRequest.get("/auth/google/url");
      const url = new URL(response.body.googleOAuthUrl);

      expect(url.hostname).toBe("accounts.google.com");
    });
  });
});
