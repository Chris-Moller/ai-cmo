import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

const sharedServerVars = {
	DATABASE_URL: z.string().url(),
	REDIS_URL: z.string().url(),
	NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
};

export function createApiEnv(runtimeEnv: Record<string, string | undefined> = process.env) {
	return createEnv({
		server: {
			...sharedServerVars,
			PORT: z.coerce.number().default(3000),
		},
		runtimeEnv,
	});
}

export function createWorkerEnv(runtimeEnv: Record<string, string | undefined> = process.env) {
	return createEnv({
		server: sharedServerVars,
		runtimeEnv,
	});
}

export function createWebEnv(runtimeEnv: Record<string, string | undefined> = process.env) {
	return createEnv({
		clientPrefix: "VITE_",
		client: {
			VITE_API_URL: z.string().url(),
		},
		runtimeEnv,
	});
}

export type ApiEnv = ReturnType<typeof createApiEnv>;
export type WorkerEnv = ReturnType<typeof createWorkerEnv>;
export type WebEnv = ReturnType<typeof createWebEnv>;
