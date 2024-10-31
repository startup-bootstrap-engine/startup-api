import { testRequest } from "@e2e/setup";
import { EncryptionHelper } from "@providers/auth/EncryptionHelper";
import { container } from "@providers/inversify/container";
import { HttpStatus } from "@startup-engine/shared";

describe("Unsubscribe User E2E", () => {
  const validSignupData = {
    email: "test@example.com",
    password: "password123",
    passwordConfirmation: "password123",
    name: "Test User",
  };

  let encryptionHelper: EncryptionHelper;
  let hashedEmail: string;

  beforeEach(async () => {
    // Create a test user
    await testRequest.post("/auth/signup").send(validSignupData);

    // Get encryption helper from container
    encryptionHelper = container.get(EncryptionHelper);
    // Create hashed email for testing
    hashedEmail = encryptionHelper.encrypt(validSignupData.email);
  });

  describe("GET /users/unsubscribe", () => {
    it("should successfully unsubscribe user with valid hashed email", async () => {
      const response = await testRequest.get(`/users/unsubscribe?hashEmail=${hashedEmail}`);

      expect(response.status).toBe(HttpStatus.OK);
      expect(response.text).toContain("</html>"); // Should return HTML content

      // Verify user is unsubscribed by trying to unsubscribe again
      const secondResponse = await testRequest.get(`/users/unsubscribe?hashEmail=${hashedEmail}`);
      expect(secondResponse.status).toBe(HttpStatus.BadRequest); // Should fail as already unsubscribed
    });

    it("should fail without hashEmail parameter", async () => {
      const response = await testRequest.get("/users/unsubscribe");

      expect(response.status).toBe(HttpStatus.InternalServerError);
      expect(response.body).toHaveProperty("status", "error");
    });

    it("should fail with empty hashEmail", async () => {
      const response = await testRequest.get("/users/unsubscribe?hashEmail=");

      expect(response.status).toBe(HttpStatus.InternalServerError);
      expect(response.body).toHaveProperty("status", "error");
    });

    it("should fail with invalid hashEmail", async () => {
      const response = await testRequest.get("/users/unsubscribe?hashEmail=invalid-hash");

      // Should fail when trying to decrypt invalid hash
      expect(response.status).toBe(HttpStatus.InternalServerError);
    });

    it("should fail for non-existent user", async () => {
      // Create hash for non-existent email
      const nonExistentHash = encryptionHelper.encrypt("nonexistent@example.com");

      const response = await testRequest.get(`/users/unsubscribe?hashEmail=${nonExistentHash}`);

      expect(response.status).toBe(HttpStatus.NotFound);
    });

    it("should fail for already unsubscribed user", async () => {
      // First unsubscribe
      await testRequest.get(`/users/unsubscribe?hashEmail=${hashedEmail}`);

      // Try to unsubscribe again
      const response = await testRequest.get(`/users/unsubscribe?hashEmail=${hashedEmail}`);

      expect(response.status).toBe(HttpStatus.BadRequest);
    });

    it("should handle URL-encoded hashEmail", async () => {
      // URL encode the hash
      const encodedHash = encodeURIComponent(hashedEmail);

      const response = await testRequest.get(`/users/unsubscribe?hashEmail=${encodedHash}`);

      expect(response.status).toBe(HttpStatus.OK);
      expect(response.text).toContain("</html>");
    });
  });
});
