import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockedGetJobById, mockedLogin } = vi.hoisted(() => ({
	mockedGetJobById: vi.fn(),
	mockedLogin: vi.fn(),
}));

vi.mock("../src/services/jobRoleApiService", async (importOriginal) => {
	const actual =
		await importOriginal<typeof import("../src/services/jobRoleApiService")>();
	return {
		...actual,
		getJobById: mockedGetJobById,
	};
});

vi.mock("../src/services/authApiService", () => ({
	login: mockedLogin,
	LoginApiError: class LoginApiError extends Error {
		statusCode: number;
		constructor(statusCode: number, message: string) {
			super(message);
			this.statusCode = statusCode;
		}
	},
}));

import app from "../src/app";

function createJob() {
	return {
		id: 1,
		roleName: "Engineer",
		location: "Remote",
		capability: { id: 1, name: "Engineering" },
		band: { id: 1, name: "Consultant" },
		closingDate: new Date("2026-08-28T22:00:00.000Z"),
		status: { id: 1, name: "OPEN" as const },
		description: "Build things",
		responsibilities: "Design; Build",
		sharepointUrl: "https://example.com",
		numberOfOpenPositions: 2,
		applications: [
			{
				id: 5,
				jobRoleId: 1,
				applicantEmail: "applicant@example.com",
				cv: "cv-content",
				status: "IN_PROGRESS" as const,
				createdAt: new Date("2026-08-17T00:00:00.000Z"),
			},
		],
	};
}

async function loginAs(role: "ADMIN" | "USER") {
	const agent = request.agent(app);
	const token = `header.${Buffer.from(JSON.stringify({ role })).toString("base64url")}.signature`;
	mockedLogin.mockResolvedValueOnce({ token, role });
	await agent.post("/login").type("form").send({
		email: "person@example.com",
		password: "Verysecure@pass",
	});
	return agent;
}

describe("job role information page applications section", () => {
	beforeEach(() => {
		mockedGetJobById.mockReset();
		mockedLogin.mockReset();
	});

	it("shows the applications table with hire/reject links for admins", async () => {
		mockedGetJobById.mockResolvedValueOnce(createJob());
		const agent = await loginAs("ADMIN");

		const response = await agent.get("/job-roles/1");

		expect(response.status).toBe(200);
		expect(response.text).toContain("Applications");
		expect(response.text).toContain("job-role-applications__table");
		expect(response.text).toContain("applicant@example.com");
		expect(response.text).toContain('href="cv-content"');
		expect(response.text).toContain(
			"job-role-applications__status--in-progress",
		);
		expect(response.text).toContain('href="/job-roles/1/applications/5/hire"');
		expect(response.text).toContain(
			'href="/job-roles/1/applications/5/reject"',
		);
		expect(response.text).toContain(
			"govuk-button--warning job-role-applications__action",
		);
	});

	it("shows text-labelled hired and rejected states without actions", async () => {
		const job = createJob();
		mockedGetJobById.mockResolvedValueOnce({
			...job,
			applications: [
				{ ...job.applications[0], status: "HIRED" as const },
				{
					...job.applications[0],
					id: 6,
					applicantEmail: "rejected@example.com",
					status: "REJECTED" as const,
				},
			],
		});
		const agent = await loginAs("ADMIN");

		const response = await agent.get("/job-roles/1");

		expect(response.status).toBe(200);
		expect(response.text).toContain("Hired");
		expect(response.text).toContain("job-role-applications__status--hired");
		expect(response.text).toContain("Rejected");
		expect(response.text).toContain("job-role-applications__status--rejected");
		expect(response.text).not.toContain(
			'class="job-role-applications__actions"',
		);
		expect(response.text).not.toContain("/applications/5/hire");
		expect(response.text).not.toContain("/applications/6/reject");
	});

	it("hides the applications section for non-admins", async () => {
		mockedGetJobById.mockResolvedValueOnce(createJob());
		const agent = await loginAs("USER");

		const response = await agent.get("/job-roles/1");

		expect(response.status).toBe(200);
		expect(response.text).not.toContain("Applications");
		expect(response.text).not.toContain("applicant@example.com");
	});

	it("shows an empty state when there are no applications", async () => {
		mockedGetJobById.mockResolvedValueOnce({
			...createJob(),
			applications: [],
		});
		const agent = await loginAs("ADMIN");

		const response = await agent.get("/job-roles/1");

		expect(response.status).toBe(200);
		expect(response.text).toContain("No applications yet for this role.");
		expect(response.text).toContain("job-role-applications__empty");
	});
});
