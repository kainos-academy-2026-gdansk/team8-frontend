import { describe, expect, it } from "vitest";
import { validateApplicationForm } from "../src/models/applicationForm";

describe("application form", () => {
	it("accepts and preserves multiline CV text", () => {
		const cv = "Jane Doe\nSoftware Engineer\n5 years";
		expect(validateApplicationForm({ cv })).toEqual({
			success: true,
			data: { cv },
		});
	});

	it("rejects an empty CV", () => {
		expect(validateApplicationForm({ cv: "   " })).toEqual({
			success: false,
			errors: { cv: "Enter your CV" },
		});
	});
});
