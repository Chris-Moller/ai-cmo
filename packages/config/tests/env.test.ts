import { describe, expect, it } from "vitest";
import { createApiEnv, createWorkerEnv, createWebEnv } from "../src/index.js";

describe("createApiEnv", () => {
	it("validates valid API environment variables", () => {
		const env = createApiEnv({
			DATABASE_URL: "postgresql://localhost:5432/test",
			REDIS_URL: "redis://localhost:6379",
			PORT: "3000",
			NODE_ENV: "test",
		});
		expect(env.DATABASE_URL).toBe("postgresql://localhost:5432/test");
		expect(env.REDIS_URL).toBe("redis://localhost:6379");
		expect(env.PORT).toBe(3000);
		expect(env.NODE_ENV).toBe("test");
	});

	it("applies default values for PORT and NODE_ENV", () => {
		const env = createApiEnv({
			DATABASE_URL: "postgresql://localhost:5432/test",
			REDIS_URL: "redis://localhost:6379",
		});
		expect(env.PORT).toBe(3000);
		expect(env.NODE_ENV).toBe("development");
	});

	it("throws on missing required DATABASE_URL", () => {
		expect(() =>
			createApiEnv({
				REDIS_URL: "redis://localhost:6379",
			}),
		).toThrow();
	});
});

describe("createWorkerEnv", () => {
	it("validates valid worker environment variables", () => {
		const env = createWorkerEnv({
			DATABASE_URL: "postgresql://localhost:5432/test",
			REDIS_URL: "redis://localhost:6379",
			NODE_ENV: "production",
		});
		expect(env.DATABASE_URL).toBe("postgresql://localhost:5432/test");
		expect(env.NODE_ENV).toBe("production");
	});
});

describe("createWebEnv", () => {
	it("validates valid web environment variables", () => {
		const env = createWebEnv({
			VITE_API_URL: "http://localhost:3000",
		});
		expect(env.VITE_API_URL).toBe("http://localhost:3000");
	});

	it("throws on missing VITE_API_URL", () => {
		expect(() => createWebEnv({})).toThrow();
	});
});
