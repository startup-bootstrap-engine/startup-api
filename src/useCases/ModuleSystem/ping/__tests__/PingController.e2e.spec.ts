import { testRequest } from "@e2e/setup";
import { HttpStatus } from "@startup-engine/shared";

describe("Ping E2E", () => {
  describe("GET /ping/:server", () => {
    it("should return 200 for valid server parameter", async () => {
      const response = await testRequest.get("/ping/api");

      expect(response.status).toBe(HttpStatus.OK);
      expect(response.body).toEqual({});
    });

    it("should accept any server parameter value", async () => {
      const servers = ["api", "web", "db", "cache", "test-server"];

      const responses = await Promise.all(servers.map((server) => testRequest.get(`/ping/${server}`)));

      responses.forEach((response) => {
        expect(response.status).toBe(HttpStatus.OK);
        expect(response.body).toEqual({});
      });
    });

    it("should handle special characters in server parameter", async () => {
      const servers = ["test.server", "test-server", "test_server", "test123"];

      const responses = await Promise.all(servers.map((server) => testRequest.get(`/ping/${server}`)));

      responses.forEach((response) => {
        expect(response.status).toBe(HttpStatus.OK);
        expect(response.body).toEqual({});
      });
    });

    it("should handle empty server parameter", async () => {
      const response = await testRequest.get("/ping/");

      expect(response.status).toBe(HttpStatus.NotFound);
    });

    it("should handle requests without server parameter", async () => {
      const response = await testRequest.get("/ping");

      expect(response.status).toBe(HttpStatus.NotFound);
    });

    it("should handle multiple slashes in path", async () => {
      const response = await testRequest.get("/ping//api");

      expect(response.status).toBe(HttpStatus.NotFound);
    });

    it("should handle URL-encoded server parameter", async () => {
      const response = await testRequest.get("/ping/" + encodeURIComponent("test server"));

      expect(response.status).toBe(HttpStatus.OK);
      expect(response.body).toEqual({});
    });
  });
});
