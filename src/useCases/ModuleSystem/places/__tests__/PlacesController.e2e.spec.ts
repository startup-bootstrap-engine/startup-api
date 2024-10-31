import { testRequest } from "@e2e/setup";
import { HttpStatus } from "@startup-engine/shared";

describe("Places E2E", () => {
  describe("GET /places/countries", () => {
    it("should return list of countries", async () => {
      const response = await testRequest.get("/places/countries");

      expect(response.status).toBe(HttpStatus.OK);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty("name");
      expect(response.body[0]).toHaveProperty("code");
    });

    it("should include cache headers", async () => {
      const response = await testRequest.get("/places/countries");

      expect(response.status).toBe(HttpStatus.OK);
      // Headers are case-insensitive
      const cacheControl = Object.keys(response.headers).find((key) => key.toLowerCase() === "cache-control");
      expect(cacheControl).toBeDefined();
      expect(response.headers[cacheControl!]).toContain("max-age=86400");
    });

    it("should return same data on subsequent requests", async () => {
      const firstResponse = await testRequest.get("/places/countries");
      const secondResponse = await testRequest.get("/places/countries");

      expect(firstResponse.status).toBe(HttpStatus.OK);
      expect(secondResponse.status).toBe(HttpStatus.OK);
      expect(firstResponse.body).toEqual(secondResponse.body);
    });
  });

  describe("GET /places/country/:code", () => {
    it("should return country and cities for valid country code", async () => {
      const response = await testRequest.get("/places/country/US");

      expect(response.status).toBe(HttpStatus.OK);
      expect(response.body).toHaveProperty("country");
      expect(response.body).toHaveProperty("cities");
      expect(response.body.country).toHaveProperty("name");
      expect(response.body.country).toHaveProperty("code");
      expect(Array.isArray(response.body.cities)).toBe(true);
      expect(response.body.cities.length).toBeGreaterThan(0);
    });

    it("should fail with invalid country code", async () => {
      const response = await testRequest.get("/places/country/XX");

      expect(response.status).toBe(HttpStatus.NotFound);
    });

    it("should handle lowercase country code", async () => {
      const response = await testRequest.get("/places/country/us");

      expect(response.status).toBe(HttpStatus.OK);
      expect(response.body.country.code).toBe("US");
    });

    it("should include cache headers", async () => {
      const response = await testRequest.get("/places/country/US");

      expect(response.status).toBe(HttpStatus.OK);
      // Headers are case-insensitive
      const cacheControl = Object.keys(response.headers).find((key) => key.toLowerCase() === "cache-control");
      expect(cacheControl).toBeDefined();
      expect(response.headers[cacheControl!]).toContain("max-age=86400");
    });
  });

  describe("GET /places/:countryNameOrCode/cities", () => {
    it("should return cities for valid country code", async () => {
      const response = await testRequest.get("/places/US/cities");

      expect(response.status).toBe(HttpStatus.OK);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(typeof response.body[0]).toBe("string");
    });

    it("should return cities for valid country name", async () => {
      const response = await testRequest.get("/places/United States/cities");

      expect(response.status).toBe(HttpStatus.OK);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it("should fail with invalid country code", async () => {
      const response = await testRequest.get("/places/XX/cities");

      expect(response.status).toBe(HttpStatus.NotFound);
    });

    it("should fail with invalid country name", async () => {
      const response = await testRequest.get("/places/Invalid Country/cities");

      expect(response.status).toBe(HttpStatus.NotFound);
    });

    it("should handle case-insensitive country name", async () => {
      const response = await testRequest.get("/places/united states/cities");

      expect(response.status).toBe(HttpStatus.OK);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it("should handle URL-encoded country names", async () => {
      const response = await testRequest.get("/places/" + encodeURIComponent("United States") + "/cities");

      expect(response.status).toBe(HttpStatus.OK);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it("should include cache headers", async () => {
      const response = await testRequest.get("/places/US/cities");

      expect(response.status).toBe(HttpStatus.OK);
      // Headers are case-insensitive
      const cacheControl = Object.keys(response.headers).find((key) => key.toLowerCase() === "cache-control");
      expect(cacheControl).toBeDefined();
      expect(response.headers[cacheControl!]).toContain("max-age=86400");
    });

    it("should return same data on subsequent requests", async () => {
      const firstResponse = await testRequest.get("/places/US/cities");
      const secondResponse = await testRequest.get("/places/US/cities");

      expect(firstResponse.status).toBe(HttpStatus.OK);
      expect(secondResponse.status).toBe(HttpStatus.OK);
      expect(firstResponse.body).toEqual(secondResponse.body);
    });
  });
});
