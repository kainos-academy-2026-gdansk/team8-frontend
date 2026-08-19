"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const applicationForm_1 = require("../src/models/applicationForm");
(0, vitest_1.describe)("application form", () => {
	(0, vitest_1.it)("accepts and preserves multiline CV text", () => {
		const cv = "Jane Doe\nSoftware Engineer\n5 years";
		(0, vitest_1.expect)(
			(0, applicationForm_1.validateApplicationForm)({ cv }),
		).toEqual({
			success: true,
			data: { cv },
		});
	});
	(0, vitest_1.it)("rejects an empty CV", () => {
		(0, vitest_1.expect)(
			(0, applicationForm_1.validateApplicationForm)({ cv: "   " }),
		).toEqual({
			success: false,
			errors: { cv: "Enter your CV" },
		});
	});
});
