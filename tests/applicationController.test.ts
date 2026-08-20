import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { NextFunction, Request, Response } from "express";

const jwtToken = "test-jwt-token";

const { mockedGetJobById, mockedHireApplication, mockedRejectApplication } =
	vi.hoisted(() => ({
		mockedGetJobById: vi.fn(),
		mockedHireApplication: vi.fn(),
		mockedRejectApplication: vi.fn(),
	}));

vi.mock("../src/services/jobRoleApiService", async (importOriginal) => {
	const actual =
		await importOriginal<typeof import("../src/services/jobRoleApiService")>();
	return {
		...actual,
		getJobById: mockedGetJobById,
	};
});

vi.mock("../src/services/applicationApiService", async (importOriginal) => {
	const actual =
		await importOriginal<
			typeof import("../src/services/applicationApiService")
		>();
	return {
		...actual,
		hireApplication: mockedHireApplication,
		rejectApplication: mockedRejectApplication,
	};
});

vi.mock("../src/config/authMiddleware", () => ({
	requireAuth: (req: Request, _res: Response, next: NextFunction) => {
		req.session.jwtToken = jwtToken;
		next();
	},
	requireAdmin: (req: Request, res: Response, next: NextFunction) => {
		if (req.headers["x-role"] === "ADMIN") {
			req.session.userRole = "ADMIN";
			next();
			return;
		}
		res.redirect("/job-roles");
	},
}));

import app from "../src/app";
import { ApplicationApiError } from "../src/services/applicationApiService";

function createJobWithApplication(
	status: "IN_PROGRESS" | "HIRED" | "REJECTED",
) {
	return {
		id: 1,
		applications: [
			{
				id: 5,
				jobRoleId: 1,
				applicantEmail: "applicant@example.com",
				cv: "cv-content",
				status,
				createdAt: new Date("2026-08-17T00:00:00.000Z"),
			},
		],
	};
}

describe("application hire/reject routes", () => {
	beforeEach(() => {
		mockedGetJobById.mockReset();
		mockedHireApplication.mockReset();
		mockedRejectApplication.mockReset();
	});

	it("renders the hire confirmation page for an admin", async () => {
		mockedGetJobById.mockResolvedValueOnce(
			createJobWithApplication("IN_PROGRESS"),
		);

		const response = await request(app)
			.get("/job-roles/1/applications/5/hire")
			.set("x-role", "ADMIN");

		expect(response.status).toBe(200);
		expect(response.text).toContain("Hire applicant@example.com?");
		expect(response.text).toContain("job-role-application-confirm--hire");
		expect(response.text).toContain(
			"govuk-button--primary job-role-application-confirm__submit",
		);
		expect(response.text).toContain(
			'action="/job-roles/1/applications/5/hire"',
		);
		expect(response.text).toContain(
			'class="govuk-link job-role-application-confirm__cancel" href="/job-roles/1"',
		);
	});

	it("renders the reject confirmation with warning action styling", async () => {
		mockedGetJobById.mockResolvedValueOnce(
			createJobWithApplication("IN_PROGRESS"),
		);

		const response = await request(app)
			.get("/job-roles/1/applications/5/reject")
			.set("x-role", "ADMIN");

		expect(response.status).toBe(200);
		expect(response.text).toContain("Reject applicant@example.com?");
		expect(response.text).toContain("job-role-application-confirm--reject");
		expect(response.text).toContain(
			"govuk-button--warning job-role-application-confirm__submit",
		);
		expect(response.text).toContain(
			'action="/job-roles/1/applications/5/reject"',
		);
	});

	it("redirects a non-admin away from the hire confirmation page", async () => {
		const response = await request(app).get("/job-roles/1/applications/5/hire");

		expect(response.status).toBe(302);
		expect(response.headers.location).toBe("/job-roles");
		expect(mockedGetJobById).not.toHaveBeenCalled();
	});

	it("returns not found when the application is not in progress", async () => {
		mockedGetJobById.mockResolvedValueOnce(createJobWithApplication("HIRED"));

		const response = await request(app)
			.get("/job-roles/1/applications/5/hire")
			.set("x-role", "ADMIN");

		expect(response.status).toBe(404);
	});

	it("hires the applicant and redirects back to the job role page", async () => {
		mockedHireApplication.mockResolvedValueOnce(undefined);

		const response = await request(app)
			.post("/job-roles/1/applications/5/hire")
			.set("x-role", "ADMIN");

		expect(mockedHireApplication).toHaveBeenCalledWith(jwtToken, 1, 5);
		expect(response.status).toBe(303);
		expect(response.headers.location).toBe("/job-roles/1");
	});

	it("re-renders the confirmation page with an error on hire failure", async () => {
		mockedHireApplication.mockRejectedValueOnce(
			new ApplicationApiError(409, "Application already hired"),
		);
		mockedGetJobById.mockResolvedValueOnce(
			createJobWithApplication("IN_PROGRESS"),
		);

		const response = await request(app)
			.post("/job-roles/1/applications/5/hire")
			.set("x-role", "ADMIN");

		expect(response.status).toBe(200);
		expect(response.text).toContain("Application already hired");
		expect(response.text).toContain("govuk-error-summary");
		expect(response.text).toContain("job-role-application-confirm__actions");
	});

	it("rejects the applicant and redirects back to the job role page", async () => {
		mockedRejectApplication.mockResolvedValueOnce(undefined);

		const response = await request(app)
			.post("/job-roles/1/applications/5/reject")
			.set("x-role", "ADMIN");

		expect(mockedRejectApplication).toHaveBeenCalledWith(jwtToken, 1, 5);
		expect(response.status).toBe(303);
		expect(response.headers.location).toBe("/job-roles/1");
	});
});
