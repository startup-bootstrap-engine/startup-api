import { testRequest } from "@e2e/setup";
import { HttpStatus } from "@startup-engine/shared";

describe("Own Info User E2E", () => {
  const userData = {
    email: "test@example.com",
    password: "password123",
    passwordConfirmation: "password123",
    name: "Test User",
    address: "123 Test St",
    phone: "1234567890",
  };

  let authToken: string;
  let userId: string;

  beforeEach(async () => {
    // Create a test user
    const signupResponse = await testRequest.post("/auth/signup").send(userData);
    userId = signupResponse.body.id;

    // Login to get auth token
    const loginResponse = await testRequest.post("/auth/login").send({
      email: userData.email,
      password: userData.password,
    });
    authToken = loginResponse.body.accessToken;
  });

  describe("GET /users/self", () => {
    it("should return authenticated user's info", async () => {
      const response = await testRequest.get("/users/self").set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(HttpStatus.OK);
      expect(response.body).toMatchObject({
        email: userData.email,
        name: userData.name,
        address: userData.address,
        phone: userData.phone,
      });
      console.log(response.body);
      expect(response.body).toHaveProperty("id", userId);
      expect(response.body).not.toHaveProperty("password");
    });

    it("should fail without auth token", async () => {
      const response = await testRequest.get("/users/self");

      expect(response.status).toBe(HttpStatus.Unauthorized);
    });

    it("should fail with invalid auth token", async () => {
      const response = await testRequest.get("/users/self").set("Authorization", "Bearer invalid-token");

      expect(response.status).toBe(HttpStatus.Unauthorized);
    });

    it("should fail with malformed auth header", async () => {
      const responses = await Promise.all([
        testRequest.get("/users/self").set("Authorization", "invalid-format"),
        testRequest.get("/users/self").set("Authorization", "Bearer"),
        testRequest.get("/users/self").set("Authorization", ""),
      ]);

      responses.forEach((response) => {
        expect(response.status).toBe(HttpStatus.Unauthorized);
      });
    });

    it("should return user info after profile update", async () => {
      // First update user profile
      const updatedData = {
        name: "Updated Name",
        address: "456 New St",
        phone: "9876543210",
      };

      await testRequest.patch("/users").set("Authorization", `Bearer ${authToken}`).send(updatedData);

      // Then get user info
      const response = await testRequest.get("/users/self").set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(HttpStatus.OK);
      expect(response.body).toMatchObject(updatedData);
      expect(response.body.email).toBe(userData.email); // Email shouldn't change
    });

    it("should return consistent data on subsequent requests", async () => {
      const firstResponse = await testRequest.get("/users/self").set("Authorization", `Bearer ${authToken}`);
      const secondResponse = await testRequest.get("/users/self").set("Authorization", `Bearer ${authToken}`);

      expect(firstResponse.status).toBe(HttpStatus.OK);
      expect(secondResponse.status).toBe(HttpStatus.OK);
      expect(firstResponse.body).toEqual(secondResponse.body);
    });

    it("should handle expired auth token", async () => {
      // Note: This test assumes the token will expire. If your tokens don't expire,
      // you might need to mock the token validation or skip this test
      const expiredToken = "expired.auth.token";
      const response = await testRequest.get("/users/self").set("Authorization", `Bearer ${expiredToken}`);

      expect(response.status).toBe(HttpStatus.Unauthorized);
    });
  });
});
