const request = require("supertest");
const app = require("../src/app");

describe("Health endpoint", () => {

  test("GET /health should return status 200", async () => {
    const res = await request(app).get("/health");
    expect(res.statusCode).toBe(200);
  });

  test("GET /health should return { status: 'ok' }", async () => {
    const res = await request(app).get("/health");
    expect(res.body).toEqual({ status: "ok" });
  });

});