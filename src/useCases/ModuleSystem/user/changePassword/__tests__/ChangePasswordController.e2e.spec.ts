import { testRequest } from "@e2e/setup";
import { HttpStatus } from "@startup-engine/shared";

describe("Change Password E2E", () => {
  const validSignupData = {
    email: "test@example.com",
    password: "password123",
    passwordConfirmation: "password123",
    name: "Test User",
  };

  const validLoginData = {
    email: validSignupData.email,
    password: validSignupData.password,
  };

  let authToken: string;

  beforeEach(async () => {
    // Create a test user
    await testRequest.post("/auth/signup").send(validSignupData);

    // Login to get auth token
    const loginResponse = await testRequest.post("/auth/login").send(validLoginData);
    authToken = loginResponse.body.accessToken;
  });

  describe("POST /auth/change-password", () => {
    const validChangePasswordData = {
      currentPassword: validSignupData.password,
      newPassword: "newpassword123",
    };

    it("should change password successfully with valid data", async () => {
      const response = await testRequest
        .post("/auth/change-password")
        .set("Authorization", `Bearer ${authToken}`)
        .send(validChangePasswordData);

      expect(response.status).toBe(HttpStatus.OK);

      // Verify can login with new password
      const loginResponse = await testRequest.post("/auth/login").send({
        email: validLoginData.email,
        password: validChangePasswordData.newPassword,
      });

      expect(loginResponse.status).toBe(HttpStatus.OK);
      expect(loginResponse.body).toHaveProperty("accessToken");
    });

    it("should fail without auth token", async () => {
      const response = await testRequest.post("/auth/change-password").send(validChangePasswordData);

      expect(response.status).toBe(HttpStatus.Unauthorized);
    });

    it("should fail with invalid auth token", async () => {
      const response = await testRequest
        .post("/auth/change-password")
        .set("Authorization", "Bearer invalid-token")
        .send(validChangePasswordData);

      expect(response.status).toBe(HttpStatus.Unauthorized);
    });

    it("should fail when current password is incorrect", async () => {
      const response = await testRequest
        .post("/auth/change-password")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          currentPassword: "wrongpassword",
          newPassword: validChangePasswordData.newPassword,
        });

      expect(response.status).toBe(HttpStatus.BadRequest);
    });

    it("should fail when new password is same as current", async () => {
      const response = await testRequest
        .post("/auth/change-password")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          currentPassword: validSignupData.password,
          newPassword: validSignupData.password,
        });

      expect(response.status).toBe(HttpStatus.BadRequest);
    });

    it("should fail without required fields", async () => {
      const responses = await Promise.all([
        testRequest
          .post("/auth/change-password")
          .set("Authorization", `Bearer ${authToken}`)
          .send({ currentPassword: validChangePasswordData.currentPassword }),
        testRequest
          .post("/auth/change-password")
          .set("Authorization", `Bearer ${authToken}`)
          .send({ newPassword: validChangePasswordData.newPassword }),
        testRequest.post("/auth/change-password").set("Authorization", `Bearer ${authToken}`).send({}),
      ]);

      responses.forEach((response) => {
        expect(response.status).toBe(HttpStatus.BadRequest);
      });
    });

    it("should fail for playstore testing user", async () => {
      // Create playstore user
      const playstoreUser = {
        ...validSignupData,
        email: "playstore-testing@gmail.com",
      };
      await testRequest.post("/auth/signup").send(playstoreUser);

      // Login as playstore user
      const playstoreLogin = await testRequest.post("/auth/login").send({
        email: playstoreUser.email,
        password: playstoreUser.password,
      });

      const response = await testRequest
        .post("/auth/change-password")
        .set("Authorization", `Bearer ${playstoreLogin.body.accessToken}`)
        .send(validChangePasswordData);

      expect(response.status).toBe(HttpStatus.BadRequest);
    });
  });
});
