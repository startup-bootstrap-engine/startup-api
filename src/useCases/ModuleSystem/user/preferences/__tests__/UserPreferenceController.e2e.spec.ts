import { testRequest } from "@e2e/setup";
import { HttpStatus } from "@startup-engine/shared";

describe("User Preference E2E", () => {
  const validSignupData = {
    email: "test@example.com",
    password: "password123",
    passwordConfirmation: "password123",
    name: "Test User",
  };

  const validUserPreferenceData = {
    theme: "dark",
    notifications: true,
  };

  let authToken: string;

  beforeEach(async () => {
    // Create a test user
    await testRequest.post("/auth/signup").send(validSignupData);

    // Login to get auth token
    const loginResponse = await testRequest.post("/auth/login").send({
      email: validSignupData.email,
      password: validSignupData.password,
    });
    authToken = loginResponse.body.accessToken;
  });

  describe("POST /user/preferences", () => {
    it("should create user preferences with valid data", async () => {
      const response = await testRequest
        .post("/user/preferences")
        .send(validUserPreferenceData)
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(HttpStatus.Created);
      expect(response.body).toMatchObject(validUserPreferenceData);
    });

    it("should return 401 for unauthenticated requests", async () => {
      const response = await testRequest.post("/user/preferences").send(validUserPreferenceData);

      expect(response.status).toBe(HttpStatus.Unauthorized);
    });
  });

  describe("GET /user/preferences", () => {
    beforeEach(async () => {
      // Create preferences before testing GET
      await testRequest
        .post("/user/preferences")
        .send(validUserPreferenceData)
        .set("Authorization", `Bearer ${authToken}`);
    });

    it("should return user preferences for authenticated user", async () => {
      const response = await testRequest.get("/user/preferences").set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(HttpStatus.OK);
      expect(response.body).toEqual(expect.objectContaining(validUserPreferenceData));
    });

    it("should return 401 for unauthenticated requests", async () => {
      const response = await testRequest.get("/user/preferences");

      expect(response.status).toBe(HttpStatus.Unauthorized);
    });
  });

  describe("PATCH /user/preferences", () => {
    beforeEach(async () => {
      // Create preferences before testing PATCH
      await testRequest
        .post("/user/preferences")
        .send(validUserPreferenceData)
        .set("Authorization", `Bearer ${authToken}`);
    });

    it("should update user preferences with valid data", async () => {
      const updateData = { theme: "light" };
      const response = await testRequest
        .patch("/user/preferences")
        .send(updateData)
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(HttpStatus.OK);
      expect(response.body).toMatchObject({
        ...validUserPreferenceData,
        ...updateData,
      });
    });

    it("should return 401 for unauthenticated requests", async () => {
      const response = await testRequest.patch("/user/preferences").send({ theme: "light" });

      expect(response.status).toBe(HttpStatus.Unauthorized);
    });
  });

  describe("DELETE /user/preferences", () => {
    beforeEach(async () => {
      // Create preferences before testing DELETE
      await testRequest
        .post("/user/preferences")
        .send(validUserPreferenceData)
        .set("Authorization", `Bearer ${authToken}`);
    });

    it("should delete user preferences for authenticated user", async () => {
      const response = await testRequest.delete("/user/preferences").set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(HttpStatus.NoContent);

      // Verify preferences were deleted
      const getResponse = await testRequest.get("/user/preferences").set("Authorization", `Bearer ${authToken}`);
      expect(getResponse.body).toBeNull();
    });

    it("should return 401 for unauthenticated requests", async () => {
      const response = await testRequest.delete("/user/preferences");

      expect(response.status).toBe(HttpStatus.Unauthorized);
    });
  });
});
