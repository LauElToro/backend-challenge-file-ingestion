import { describe, it, expect } from "vitest";
import Fastify from "fastify";

describe("Health check endpoint", () => {
  it("responde con 200 OK", async () => {
    const fastify = Fastify();
    fastify.get("/health", async () => ({ status: "ok" }));

    const response = await fastify.inject({ method: "GET", url: "/health" });
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ status: "ok" });
  });
});
