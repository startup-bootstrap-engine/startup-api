import { testRequest } from "@e2e/setup";
import { HttpStatus } from "@startup-engine/shared";

describe("AB Test E2E", () => {
  const validABTestData = {
    name: "Test AB Test",
    slug: "test-ab-test",
    description: "Test description",
    enabled: true,
  };

  describe("POST /ab-tests", () => {
    it("should create AB test with valid data", async () => {
      const response = await testRequest.post("/ab-tests").send(validABTestData);

      expect(response.status).toBe(HttpStatus.OK);
      expect(response.body).toMatchObject(validABTestData);
      expect(response.body).toHaveProperty("_id");
    });

    it("should create AB test without optional enabled field", async () => {
      const { enabled, ...requiredData } = validABTestData;
      const response = await testRequest.post("/ab-tests").send(requiredData);

      expect(response.status).toBe(HttpStatus.OK);
      expect(response.body).toMatchObject(requiredData);
    });

    it("should fail without required fields", async () => {
      const responses = await Promise.all([
        testRequest.post("/ab-tests").send({}),
        testRequest.post("/ab-tests").send({ name: validABTestData.name }),
        testRequest.post("/ab-tests").send({ slug: validABTestData.slug }),
        testRequest.post("/ab-tests").send({ description: validABTestData.description }),
      ]);

      responses.forEach((response) => {
        expect(response.status).toBe(HttpStatus.BadRequest);
      });
    });

    it("should fail with invalid field types", async () => {
      const invalidData = [
        { ...validABTestData, name: 123 },
        { ...validABTestData, slug: true },
        { ...validABTestData, description: {} },
        { ...validABTestData, enabled: "true" },
      ];

      const responses = await Promise.all(invalidData.map((data) => testRequest.post("/ab-tests").send(data)));

      responses.forEach((response) => {
        expect(response.status).toBe(HttpStatus.BadRequest);
      });
    });
  });

  describe("GET /ab-tests/:id", () => {
    let createdTest;

    beforeEach(async () => {
      const response = await testRequest.post("/ab-tests").send(validABTestData);
      createdTest = response.body;
    });

    it("should get AB test by valid ID", async () => {
      const response = await testRequest.get(`/ab-tests/${createdTest._id}`);

      expect(response.status).toBe(HttpStatus.OK);
      expect(response.body).toMatchObject(validABTestData);
    });

    it("should return null for invalid ID", async () => {
      const response = await testRequest.get("/ab-tests/507f1f77bcf86cd799439011");

      expect(response.status).toBe(HttpStatus.OK);
      expect(response.body).toBeNull();
    });
  });

  describe("GET /ab-tests", () => {
    beforeEach(async () => {
      // Create multiple AB tests
      await Promise.all([
        testRequest.post("/ab-tests").send(validABTestData),
        testRequest.post("/ab-tests").send({
          ...validABTestData,
          name: "Second Test",
          slug: "second-test",
        }),
      ]);
    });

    it("should get all AB tests", async () => {
      const response = await testRequest.get("/ab-tests");

      expect(response.status).toBe(HttpStatus.OK);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThanOrEqual(2);
    });

    it("should filter AB tests by query", async () => {
      const response = await testRequest.get("/ab-tests").query({ name: "Second Test" });

      expect(response.status).toBe(HttpStatus.OK);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(1);
      expect(response.body[0].name).toBe("Second Test");
    });

    it("should return empty array for no matches", async () => {
      const response = await testRequest.get("/ab-tests").query({ name: "Non Existent" });

      expect(response.status).toBe(HttpStatus.OK);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(0);
    });
  });

  describe("PATCH /ab-tests/:id", () => {
    let createdTest;

    beforeEach(async () => {
      const response = await testRequest.post("/ab-tests").send(validABTestData);
      createdTest = response.body;
    });

    it("should update AB test with valid data", async () => {
      const updates = {
        name: "Updated Name",
        description: "Updated description",
        enabled: false,
      };

      const response = await testRequest.patch(`/ab-tests/${createdTest._id}`).send(updates);

      expect(response.status).toBe(HttpStatus.OK);
      expect(response.body).toMatchObject(updates);
      expect(response.body.slug).toBe(createdTest.slug); // Unchanged field
    });

    it("should update single field", async () => {
      const response = await testRequest.patch(`/ab-tests/${createdTest._id}`).send({
        name: "Only Name Updated",
      });

      expect(response.status).toBe(HttpStatus.OK);
      expect(response.body.name).toBe("Only Name Updated");
      expect(response.body.description).toBe(createdTest.description); // Other fields unchanged
    });

    it("should return null for invalid ID", async () => {
      const response = await testRequest.patch("/ab-tests/507f1f77bcf86cd799439011").send({
        name: "Updated Name",
      });

      expect(response.status).toBe(HttpStatus.OK);
      expect(response.body).toBeNull();
    });

    it("should fail with invalid field types", async () => {
      const responses = await Promise.all([
        testRequest.patch(`/ab-tests/${createdTest._id}`).send({ name: 123 }),
        testRequest.patch(`/ab-tests/${createdTest._id}`).send({ enabled: "true" }),
      ]);

      responses.forEach((response) => {
        expect(response.status).toBe(HttpStatus.BadRequest);
      });
    });
  });

  describe("DELETE /ab-tests/:id", () => {
    let createdTest;

    beforeEach(async () => {
      const response = await testRequest.post("/ab-tests").send(validABTestData);
      createdTest = response.body;
    });

    it("should delete AB test with valid ID", async () => {
      const deleteResponse = await testRequest.delete(`/ab-tests/${createdTest._id}`);
      expect(deleteResponse.status).toBe(HttpStatus.OK);
      expect(deleteResponse.body).toBe(true);

      // Verify deletion
      const getResponse = await testRequest.get(`/ab-tests/${createdTest._id}`);
      expect(getResponse.body).toBeNull();
    });

    it("should return false for invalid ID", async () => {
      const response = await testRequest.delete("/ab-tests/507f1f77bcf86cd799439011");

      expect(response.status).toBe(HttpStatus.OK);
      expect(response.body).toBe(false);
    });
  });
});
