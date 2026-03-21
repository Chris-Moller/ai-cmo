import { describe, expect, it } from "vitest";
import { AppError, NotFoundError, ValidationError, createLogger } from "../src/index.js";

describe("createLogger", () => {
	it("creates a pino logger instance", () => {
		const logger = createLogger("test");
		expect(logger).toBeDefined();
		expect(typeof logger.info).toBe("function");
		expect(typeof logger.error).toBe("function");
		expect(typeof logger.warn).toBe("function");
	});
});

describe("AppError", () => {
	it("has default status code 500", () => {
		const err = new AppError("something broke");
		expect(err.message).toBe("something broke");
		expect(err.statusCode).toBe(500);
		expect(err.name).toBe("AppError");
	});

	it("accepts custom status code and code", () => {
		const err = new AppError("bad request", 400, "BAD_INPUT");
		expect(err.statusCode).toBe(400);
		expect(err.code).toBe("BAD_INPUT");
	});
});

describe("NotFoundError", () => {
	it("has status code 404", () => {
		const err = new NotFoundError();
		expect(err.statusCode).toBe(404);
		expect(err.code).toBe("NOT_FOUND");
		expect(err.name).toBe("NotFoundError");
		expect(err instanceof AppError).toBe(true);
	});
});

describe("ValidationError", () => {
	it("has status code 400", () => {
		const err = new ValidationError();
		expect(err.statusCode).toBe(400);
		expect(err.code).toBe("VALIDATION_ERROR");
		expect(err.name).toBe("ValidationError");
		expect(err instanceof AppError).toBe(true);
	});
});
