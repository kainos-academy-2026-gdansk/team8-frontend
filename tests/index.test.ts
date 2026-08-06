import request from "supertest";
import { describe, expect, it } from "vitest";

import app from "../src/app";

describe("Vitest smoke", () => {
	it("runs basic assertions", () => {
		expect(1 + 1).toBe(2);
	});

	it("responds on GET /", async () => {
		const response = await request(app).get("/");

		expect(response.status).toBe(200);
		expect(response.text).toBeTypeOf("string");
		expect(response.text).toContain("Hello world!");
	});
});
