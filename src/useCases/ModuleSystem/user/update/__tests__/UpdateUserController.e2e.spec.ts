import { testRequest } from "@e2e/setup";
import { HttpStatus } from "@startup-engine/shared";

describe("Update User E2E", () => {
  const validSignupData = {
    email: "test@example.com",
    password: "password123",
    passwordConfirmation: "password123",
    name: "Test User",
    address: "123 Test St",
    phone: "1234567890",
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

  describe("PATCH /users", () => {
    it("should update single field successfully", async () => {
      const newName = "Updated Name";
      const response = await testRequest
        .patch("/users")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ name: newName });

      expect(response.status).toBe(HttpStatus.OK);
      expect(response.body).toHaveProperty("name", newName);
      expect(response.body).toHaveProperty("email", validSignupData.email); // Other fields unchanged
    });

    it("should update multiple fields successfully", async () => {
      const updates = {
        name: "New Name",
        address: "456 New St",
        phone: "9876543210",
      };

      const response = await testRequest.patch("/users").set("Authorization", `Bearer ${authToken}`).send(updates);

      expect(response.status).toBe(HttpStatus.OK);
      expect(response.body).toHaveProperty("name", updates.name);
      expect(response.body).toHaveProperty("address", updates.address);
      expect(response.body).toHaveProperty("phone", updates.phone);
      expect(response.body).toHaveProperty("email", validSignupData.email); // Email unchanged
    });

    it("should update pushNotificationToken successfully", async () => {
      const updates = {
        pushNotificationToken: "new-push-token",
      };

      const response = await testRequest.patch("/users").set("Authorization", `Bearer ${authToken}`).send(updates);

      expect(response.status).toBe(HttpStatus.OK);
      expect(response.body).toHaveProperty("pushNotificationToken", updates.pushNotificationToken);
    });

    it("should succeed with same values", async () => {
      const response = await testRequest.patch("/users").set("Authorization", `Bearer ${authToken}`).send({
        name: validSignupData.name,
        address: validSignupData.address,
      });

      expect(response.status).toBe(HttpStatus.OK);
      expect(response.body).toHaveProperty("name", validSignupData.name);
      expect(response.body).toHaveProperty("address", validSignupData.address);
    });

    it("should fail without auth token", async () => {
      const response = await testRequest.patch("/users").send({ name: "New Name" });

      expect(response.status).toBe(HttpStatus.Unauthorized);
    });

    it("should fail with invalid auth token", async () => {
      const response = await testRequest
        .patch("/users")
        .set("Authorization", "Bearer invalid-token")
        .send({ name: "New Name" });

      expect(response.status).toBe(HttpStatus.Unauthorized);
    });

    it("should fail with non-string values", async () => {
      const responses = await Promise.all([
        testRequest.patch("/users").set("Authorization", `Bearer ${authToken}`).send({ name: 123 }),
        testRequest.patch("/users").set("Authorization", `Bearer ${authToken}`).send({ address: true }),
        testRequest
          .patch("/users")
          .set("Authorization", `Bearer ${authToken}`)
          .send({ phone: { value: "123" } }),
      ]);

      responses.forEach((response) => {
        expect(response.status).toBe(HttpStatus.BadRequest);
      });
    });

    it("should ignore unknown fields", async () => {
      const validField = { name: "New Name" };
      const unknownField = { unknownField: "some value" };

      const response = await testRequest
        .patch("/users")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ ...validField, ...unknownField });

      expect(response.status).toBe(HttpStatus.BadRequest);
      expect(response.body).toHaveProperty(
        "message",
        expect.arrayContaining(["property unknownField should not exist"])
      );
    });

    it("should accept empty update object", async () => {
      const response = await testRequest.patch("/users").set("Authorization", `Bearer ${authToken}`).send({});

      expect(response.status).toBe(HttpStatus.OK);
      // Should return user without changes
      expect(response.body).toHaveProperty("name", validSignupData.name);
      expect(response.body).toHaveProperty("email", validSignupData.email);
    });
  });
});
