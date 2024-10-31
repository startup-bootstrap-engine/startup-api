import { testRequest } from "@e2e/setup";
import { HttpStatus } from "@startup-engine/shared";

describe("Auth Signup E2E", () => {
  const validSignupData = {
    email: "test@example.com",
    password: "password123",
    passwordConfirmation: "password123",
    name: "Test User",
    address: "123 Test St",
    phone: "1234567890",
  };

  describe("POST /auth/signup", () => {
    it("should create a new user with valid data", async () => {
      const response = await testRequest.post("/auth/signup").send(validSignupData);

      expect(response.status).toBe(HttpStatus.Created);
      expect(response.body._doc).toHaveProperty("email", validSignupData.email);
      expect(response.body._doc).toHaveProperty("name", validSignupData.name);
      expect(response.body._doc).not.toHaveProperty("password");
    });

    it("should fail with invalid email", async () => {
      const response = await testRequest.post("/auth/signup").send({
        ...validSignupData,
        email: "invalid-email",
      });

      expect(response.status).toBe(HttpStatus.BadRequest);
    });

    it("should fail when passwords don't match", async () => {
      const response = await testRequest.post("/auth/signup").send({
        ...validSignupData,
        passwordConfirmation: "different-password",
      });

      expect(response.status).toBe(HttpStatus.BadRequest);
    });

    it("should fail when email is already registered", async () => {
      // First signup
      await testRequest.post("/auth/signup").send(validSignupData);

      // Try to signup with same email
      const response = await testRequest.post("/auth/signup").send(validSignupData);

      expect(response.status).toBe(HttpStatus.Conflict);
    });

    it("should fail without required fields", async () => {
      const minimalSignupData = {
        email: "minimal@example.com",
      };

      const response = await testRequest.post("/auth/signup").send(minimalSignupData);

      expect(response.status).toBe(HttpStatus.BadRequest);
    });
  });
});
