import { testRequest } from "@e2e/setup";
import { HttpStatus } from "@startup-engine/shared";

describe("Auth Login E2E", () => {
  const validSignupData = {
    email: "test@example.com",
    password: "password123",
    passwordConfirmation: "password123",
    name: "Test User",
    address: "123 Test St",
    phone: "1234567890",
  };

  const validLoginData = {
    email: validSignupData.email,
    password: validSignupData.password,
  };

  beforeEach(async () => {
    // Create a test user before each test
    await testRequest.post("/auth/signup").send(validSignupData);
  });

  describe("POST /auth/login", () => {
    it("should login successfully with valid credentials", async () => {
      const response = await testRequest.post("/auth/login").send(validLoginData);

      expect(response.status).toBe(HttpStatus.OK);
      expect(response.body).toHaveProperty("accessToken");
      expect(response.body).toHaveProperty("refreshToken");
    });

    it("should fail with invalid email", async () => {
      const response = await testRequest.post("/auth/login").send({
        ...validLoginData,
        email: "nonexistent@example.com",
      });

      expect(response.status).toBe(HttpStatus.Unauthorized);
    });

    it("should fail with invalid password", async () => {
      const response = await testRequest.post("/auth/login").send({
        ...validLoginData,
        password: "wrongpassword",
      });

      expect(response.status).toBe(HttpStatus.Unauthorized);
    });

    it("should fail without required fields", async () => {
      const responses = await Promise.all([
        testRequest.post("/auth/login").send({ email: validLoginData.email }),
        testRequest.post("/auth/login").send({ password: validLoginData.password }),
        testRequest.post("/auth/login").send({}),
      ]);

      responses.forEach((response) => {
        expect(response.status).toBe(HttpStatus.BadRequest);
      });
    });

    it("should fail with empty string credentials", async () => {
      const response = await testRequest.post("/auth/login").send({
        email: "",
        password: "",
      });

      expect(response.status).toBe(HttpStatus.BadRequest);
    });
  });
});
