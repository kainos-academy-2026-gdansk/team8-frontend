import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { NextFunction, Request, Response } from "express";

const { mockedGetJobById, mockedSubmitApplication } = vi.hoisted(() => ({
	mockedGetJobById: vi.fn(),
	mockedSubmitApplication: vi.fn(),
}));

let currentRole = "USER";

vi.mock("../src/services/jobRoleApiService", async (importOriginal) => {
	const actual =
		await importOriginal<typeof import("../src/services/jobRoleApiService")>();
	return { ...actual, getJobById: mockedGetJobById };
});

vi.mock("../src/services/applicationApiService", async (importOriginal) => {
	const actual =
		await importOriginal<
			typeof import("../src/services/applicationApiService")
		>();
	return { ...actual, submitApplication: mockedSubmitApplication };
});

vi.mock("../src/config/authMiddleware", () => ({
	requireAuth: (req: Request, _res: Response, next: NextFunction) => {
		req.session.jwtToken = "jwt-token";
		req.session.userRole = currentRole;
		next();
	},
}));

import app from "../src/app";

function createJob(overrides: Record<string, unknown> = {}) {
	return {
		id: 1,
		roleName: "Software Engineer",
		location: "Remote",
		capability: { id: 1, name: "Engineering" },
		band: { id: 1, name: "Consultant" },
		closingDate: new Date("2026-08-28T22:00:00.000Z"),
		status: { id: 1, name: "OPEN" as const },
		description: "Build useful software.",
		responsibilities: "Build software;Review code",
		sharepointUrl: "https://example.com",
		numberOfOpenPositions: 2,
		...overrides,
	};
}

describe("job applications", () => {
	beforeEach(() => {
		currentRole = "USER";
		mockedGetJobById.mockReset();
		mockedSubmitApplication.mockReset();
		mockedGetJobById.mockResolvedValue(createJob());
		mockedSubmitApplication.mockResolvedValue({
			id: 1,
			jobRoleId: 1,
			status: "IN_PROGRESS",
			createdAt: "2026-08-18T00:00:00.000Z",
		});
	});

	it("renders the apply link for an applicant and available open role", async () => {
		const response = await request(app).get("/job-roles/1");

		expect(response.status).toBe(200);
		expect(response.text).toContain('href="/job-roles/1/applications/new"');
	});

	it.each([
		["non-applicant", "ADMIN", createJob()],
		["closed role", "USER", createJob({ status: { id: 2, name: "CLOSED" } })],
		["full role", "USER", createJob({ numberOfOpenPositions: 0 })],
		["negative positions", "USER", createJob({ numberOfOpenPositions: -1 })],
	])("does not render apply link for %s", async (_caseName, role, job) => {
		currentRole = role;
		mockedGetJobById.mockResolvedValueOnce(job);

		const response = await request(app).get("/job-roles/1");

		expect(response.status).toBe(200);
		expect(response.text).not.toContain("/applications/new");
	});

	it("renders the CV form for an applicant", async () => {
		const response = await request(app).get("/job-roles/1/applications/new");

		expect(response.status).toBe(200);
		expect(response.text).toContain('name="cv"');
		expect(response.text).toContain('action="/job-roles/1/applications/new"');
	});

	it("rejects an empty CV without submitting it", async () => {
		const response = await request(app)
			.post("/job-roles/1/applications/new")
			.type("form")
			.send({ cv: "   " });

		expect(response.status).toBe(400);
		expect(response.text).toContain("Enter your CV");
		expect(mockedSubmitApplication).not.toHaveBeenCalled();
	});

	it("preserves backend conflict feedback and CV text", async () => {
		const error = new (
			await import("../src/services/applicationApiService")
		).ApplicationApiError(409, "Application already exists for this job role");
		mockedSubmitApplication.mockRejectedValueOnce(error);

		const response = await request(app)
			.post("/job-roles/1/applications/new")
			.type("form")
			.send({ cv: "Jane Doe\nSoftware Engineer" });

		expect(response.status).toBe(409);
		expect(response.text).toContain(
			"Application already exists for this job role",
		);
		expect(response.text).toContain("Jane Doe");
	});

	it("redirects after a successful application without sending status", async () => {
		const response = await request(app)
			.post("/job-roles/1/applications/new")
			.type("form")
			.send({ cv: "Jane Doe\nSoftware Engineer" });

		expect(response.status).toBe(302);
		expect(response.headers.location).toBe("/job-roles/1/applications/success");
		expect(mockedSubmitApplication).toHaveBeenCalledWith(
			1,
			"Jane Doe\nSoftware Engineer",
			"jwt-token",
		);
	});

	it("returns forbidden for direct non-applicant access", async () => {
		currentRole = "ADMIN";

		const response = await request(app).get("/job-roles/1/applications/new");

		expect(response.status).toBe(403);
		expect(response.text).toContain("Access denied");
	});
});
