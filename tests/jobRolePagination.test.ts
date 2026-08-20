import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { NextFunction, Request, Response } from "express";
import type { JobRolePage } from "../src/models/jobRole";
import { buildPagination } from "../src/services/jobRoleApiService";

const jwtToken = "test-jwt-token";
const defaultSort = { sortBy: "status", sortOrder: "desc" } as const;

const { mockedGetAllJobRoles, mockedGetJobById } = vi.hoisted(() => ({
	mockedGetAllJobRoles: vi.fn(),
	mockedGetJobById: vi.fn(),
}));

vi.mock("../src/services/jobRoleApiService", async (importOriginal) => {
	const actual =
		await importOriginal<typeof import("../src/services/jobRoleApiService")>();
	return {
		...actual,
		getAllJobRoles: mockedGetAllJobRoles,
		getJobById: mockedGetJobById,
	};
});

vi.mock("../src/config/authMiddleware", () => ({
	requireAuth: (req: Request, _res: Response, next: NextFunction) => {
		req.session.jwtToken = jwtToken;
		req.session.userRole =
			req.get("x-test-user-role") === "USER" ? "USER" : "ADMIN";
		next();
	},
	requireAdmin: (req: Request, res: Response, next: NextFunction) => {
		if (req.session.userRole === "ADMIN") {
			next();
			return;
		}
		res.redirect("/job-roles");
	},
}));

import app from "../src/app";

function createJobRole(id: number) {
	return {
		id,
		roleName: `Role ${id}`,
		location: "Remote",
		capability: { id: 1, name: "Engineering" },
		band: { id: 1, name: "Consultant" },
		closingDate: new Date("2026-08-28T22:00:00.000Z"),
		status: { id: 1, name: "OPEN" as const },
	};
}

function createPage(offset: number, total = 14): JobRolePage {
	const pageSize = Math.min(10, Math.max(0, total - offset));
	return {
		jobRoles: Array.from({ length: pageSize }, (_, index) =>
			createJobRole(offset + index + 1),
		),
		total,
		limit: 10,
		offset,
	};
}

describe("GET /job-roles pagination", () => {
	beforeEach(() => {
		mockedGetAllJobRoles.mockReset();
		mockedGetJobById.mockReset();
	});

	it("loads the first ten roles and disables backward controls", async () => {
		mockedGetAllJobRoles.mockResolvedValueOnce(createPage(0));

		const response = await request(app).get("/job-roles");

		expect(response.status).toBe(200);
		expect(mockedGetAllJobRoles).toHaveBeenCalledWith(
			jwtToken,
			10,
			0,
			undefined,
			defaultSort,
		);
		expect(response.text).toContain("Showing 1 to 10 of 14 job roles");
		expect(response.text).toContain(
			'job-role-pagination__button--disabled" aria-disabled="true">First',
		);
		expect(response.text).toContain(
			'job-role-pagination__direction-link--disabled" aria-disabled="true"',
		);
		expect(response.text).toContain(
			'href="/job-roles?limit=10&amp;offset=10&amp;sortBy=status&amp;sortOrder=desc" rel="next"',
		);
		expect(response.text).toContain(
			'href="/job-roles?limit=10&amp;offset=10&amp;sortBy=status&amp;sortOrder=desc" rel="last"',
		);
		expect(response.text).toContain(
			'aria-label="Page 1" aria-current="page">1',
		);
		expect(response.text).toContain('aria-label="Page 2">2');
	});

	it("loads the next page and disables forward controls on the last page", async () => {
		mockedGetAllJobRoles.mockResolvedValueOnce(createPage(10));

		const response = await request(app).get("/job-roles?limit=10&offset=10");

		expect(response.status).toBe(200);
		expect(mockedGetAllJobRoles).toHaveBeenCalledWith(
			jwtToken,
			10,
			10,
			undefined,
			defaultSort,
		);
		expect(response.text).toContain("Showing 11 to 14 of 14 job roles");
		expect(response.text).toContain(
			'href="/job-roles?limit=10&amp;offset=0&amp;sortBy=status&amp;sortOrder=desc" rel="first">First',
		);
		expect(response.text).toContain(
			'href="/job-roles?limit=10&amp;offset=0&amp;sortBy=status&amp;sortOrder=desc" rel="prev"',
		);
		expect(response.text).toContain(
			'job-role-pagination__direction-link--disabled" aria-disabled="true"',
		);
		expect(response.text).toContain(
			'job-role-pagination__button--disabled" aria-disabled="true">Last',
		);
		expect(response.text).toContain(
			'aria-label="Page 2" aria-current="page">2',
		);
	});

	it("summarizes the returned item for a non-page-aligned offset", async () => {
		mockedGetAllJobRoles.mockResolvedValueOnce(createPage(13, 14));

		const response = await request(app).get("/job-roles?limit=10&offset=13");

		expect(response.status).toBe(200);
		expect(mockedGetAllJobRoles).toHaveBeenCalledWith(
			jwtToken,
			10,
			13,
			undefined,
			defaultSort,
		);
		expect(response.text).toContain("Showing 14 to 14 of 14 job roles");
	});

	it("keeps directional links aligned with numbered pages", () => {
		const pagination = buildPagination({
			total: 35,
			limit: 10,
			offset: 13,
		});

		expect(pagination.currentPage).toBe(2);
		expect(pagination.previousOffset).toBe(0);
		expect(pagination.nextOffset).toBe(20);
		expect(pagination.previousHref).toBe("/job-roles?limit=10&offset=0");
		expect(pagination.nextHref).toBe("/job-roles?limit=10&offset=20");
		expect(pagination.hasPrevious).toBe(true);
		expect(pagination.hasNext).toBe(true);
	});

	it("clamps an out-of-range offset and shows an error summary", async () => {
		mockedGetAllJobRoles
			.mockResolvedValueOnce(createPage(20, 14))
			.mockResolvedValueOnce(createPage(10, 14));

		const response = await request(app).get("/job-roles?limit=10&offset=20");

		expect(response.status).toBe(200);
		expect(mockedGetAllJobRoles).toHaveBeenNthCalledWith(
			2,
			jwtToken,
			10,
			10,
			undefined,
			defaultSort,
		);
		expect(response.text).toContain("There is a problem");
		expect(response.text).toContain(
			"The page you requested does not exist. Showing the nearest available results.",
		);
		expect(response.text).toContain("Showing 11 to 14 of 14 job roles");
	});

	it("falls back to the fixed page size and first offset for invalid values", async () => {
		mockedGetAllJobRoles.mockResolvedValueOnce(createPage(0));

		const response = await request(app).get(
			"/job-roles?limit=25&offset=not-a-number",
		);

		expect(response.status).toBe(200);
		expect(mockedGetAllJobRoles).toHaveBeenCalledWith(
			jwtToken,
			10,
			0,
			undefined,
			defaultSort,
		);
	});

	it("does not render pagination for an empty result set", async () => {
		mockedGetAllJobRoles.mockResolvedValueOnce(createPage(0, 0));

		const response = await request(app).get("/job-roles");

		expect(response.status).toBe(200);
		expect(response.text).toContain("No job roles found.");
		expect(response.text).toContain(
			'href="/job-roles/new">Add new job role</a>',
		);
		expect(response.text).not.toContain('aria-label="Pagination"');
	});

	it("does not show the create action to regular users in an empty result set", async () => {
		mockedGetAllJobRoles.mockResolvedValueOnce(createPage(0, 0));

		const response = await request(app)
			.get("/job-roles")
			.set("x-test-user-role", "USER");

		expect(response.status).toBe(200);
		expect(response.text).toContain("No job roles found.");
		expect(response.text).not.toContain(
			'href="/job-roles/new">Add new job role</a>',
		);
	});

	it("renders filter controls with the approved static options", async () => {
		mockedGetAllJobRoles.mockResolvedValueOnce(createPage(0));

		const response = await request(app).get("/job-roles");

		expect(response.text).toContain('name="roleName"');
		expect(response.text).toContain('name="location"');
		expect(response.text).toContain('value="Software Engineering"');
		expect(response.text).toContain('value="Director"');
		expect(response.text).toContain('value="OPEN"');
		expect(response.text).toContain('name="closingDateAfter"');
		expect(response.text).toContain('name="closingDateBefore"');
	});

	it("paginates filtered results and retains their values", async () => {
		mockedGetAllJobRoles.mockResolvedValueOnce(createPage(10, 14));

		const response = await request(app).get(
			"/job-roles?offset=10&roleName=Engineer&location=Gdansk&capability=Software%20Engineering&capability=Cloud&band=Consultant&status=OPEN&closingDateAfter=2026-08-01&closingDateBefore=2026-08-31",
		);

		expect(mockedGetAllJobRoles).toHaveBeenCalledWith(jwtToken, 10, 10, {
			roleName: "Engineer",
			location: "Gdansk",
			capability: ["Software Engineering", "Cloud"],
			band: ["Consultant"],
			status: ["OPEN"],
			closingDateAfter: "2026-08-01",
			closingDateBefore: "2026-08-31",
		},
		defaultSort,
	);
		expect(response.text).toContain('value="Engineer"');
		expect(response.text).toContain('value="Software Engineering" checked');
		expect(response.text).toContain('value="OPEN" checked');
		expect(response.text).toContain("14 job roles found");
		expect(response.text).toContain(
			'href="/job-roles?limit=10&amp;offset=0&amp;sortBy=status&amp;sortOrder=desc">Clear filters</a>',
		);
		expect(response.text).toContain('aria-label="Pagination"');
		expect(response.text).toContain(
			'href="/job-roles?limit=10&amp;offset=0&amp;roleName=Engineer',
		);
	});

	it("forwards active sort parameters to the API", async () => {
		mockedGetAllJobRoles.mockResolvedValueOnce(createPage(0, 14));

		const response = await request(app).get(
			"/job-roles?sortBy=closingDate&sortOrder=desc",
		);

		expect(response.status).toBe(200);
		expect(mockedGetAllJobRoles).toHaveBeenCalledWith(
			jwtToken,
			10,
			0,
			undefined,
			{ sortBy: "closingDate", sortOrder: "desc" },
		);
	});

	it("renders 3-state sort links that reset offset to the first page", async () => {
		mockedGetAllJobRoles.mockResolvedValueOnce(createPage(0, 14));

		const unsortedResponse = await request(app).get("/job-roles");
		expect(unsortedResponse.text).toContain(
			'href="/job-roles?limit=10&amp;offset=0"',
		);
		expect(unsortedResponse.text).toContain(
			"job-role-sort-controls__link--desc",
		);
		expect(unsortedResponse.text).toContain(
			'href="/job-roles?limit=10&amp;offset=0&amp;sortBy=roleName&amp;sortOrder=asc"',
		);
		expect(unsortedResponse.text).toContain("Role name");
		expect(unsortedResponse.text).toContain(
			"job-role-sort-controls__link--none",
		);
		expect(unsortedResponse.text).toContain("&#8597;");

		mockedGetAllJobRoles.mockResolvedValueOnce(createPage(0, 14));
		const ascResponse = await request(app).get(
			"/job-roles?offset=10&sortBy=roleName&sortOrder=asc",
		);
		expect(ascResponse.text).toContain(
			'href="/job-roles?limit=10&amp;offset=0&amp;sortBy=roleName&amp;sortOrder=desc"',
		);
		expect(ascResponse.text).toContain("job-role-sort-controls__link--asc");
		expect(ascResponse.text).toContain("&#8593;");

		mockedGetAllJobRoles.mockResolvedValueOnce(createPage(0, 14));
		const descResponse = await request(app).get(
			"/job-roles?offset=10&sortBy=roleName&sortOrder=desc",
		);
		expect(descResponse.text).toContain(
			'href="/job-roles?limit=10&amp;offset=0"',
		);
		expect(descResponse.text).toContain("job-role-sort-controls__link--desc");
		expect(descResponse.text).toContain("&#8595;");
	});

	it("preserves sorting across filter apply, clear filters, and pagination links", async () => {
		mockedGetAllJobRoles.mockResolvedValueOnce(createPage(0, 14));

		const response = await request(app).get(
			"/job-roles?roleName=Engineer&sortBy=status&sortOrder=asc",
		);

		expect(response.text).toContain(
			'<input type="hidden" name="sortBy" value="status">',
		);
		expect(response.text).toContain(
			'<input type="hidden" name="sortOrder" value="asc">',
		);
		expect(response.text).toContain(
			'href="/job-roles?limit=10&amp;offset=0&amp;sortBy=status&amp;sortOrder=asc">Clear filters</a>',
		);
		expect(response.text).toContain(
			'href="/job-roles?limit=10&amp;offset=10&amp;roleName=Engineer&amp;sortBy=status&amp;sortOrder=asc" rel="next"',
		);
	});

	it("ignores incomplete or invalid sort values", async () => {
		mockedGetAllJobRoles.mockResolvedValueOnce(createPage(0, 14));

		await request(app).get("/job-roles?sortBy=roleName");
		expect(mockedGetAllJobRoles).toHaveBeenLastCalledWith(
			jwtToken,
			10,
			0,
			undefined,
			defaultSort,
		);

		mockedGetAllJobRoles.mockResolvedValueOnce(createPage(0, 14));
		await request(app).get("/job-roles?sortBy=unknown&sortOrder=asc");
		expect(mockedGetAllJobRoles).toHaveBeenLastCalledWith(
			jwtToken,
			10,
			0,
			undefined,
			defaultSort,
		);
	});

	it("ignores invalid filters and keeps unfiltered pagination", async () => {
		mockedGetAllJobRoles.mockResolvedValueOnce(createPage(0));

		const response = await request(app).get(
			"/job-roles?status=UNKNOWN&closingDateAfter=not-a-date",
		);

		expect(mockedGetAllJobRoles).toHaveBeenCalledWith(
			jwtToken,
			10,
			0,
			undefined,
			defaultSort,
		);
		expect(response.text).toContain('aria-label="Pagination"');
		expect(response.text).not.toContain("Clear filters");
	});

	it("shows a filter-aware empty state without pagination", async () => {
		mockedGetAllJobRoles.mockResolvedValueOnce(createPage(0, 0));

		const response = await request(app).get("/job-roles?roleName=Missing");

		expect(response.text).toContain("No job roles match your filters.");
		expect(response.text).not.toContain('aria-label="Pagination"');
	});

	it("renders an error page when loading job roles fails", async () => {
		mockedGetAllJobRoles.mockRejectedValueOnce(
			new Error("Backend unavailable"),
		);

		const response = await request(app).get("/job-roles");

		expect(response.status).toBe(500);
		expect(response.text).toContain(
			"Failed to load job roles. Please try again later.",
		);
	});

	it("redirects to login when the API rejects the token", async () => {
		mockedGetAllJobRoles.mockRejectedValueOnce(new Error("Unauthorized"));

		const response = await request(app).get("/job-roles");

		expect(response.status).toBe(302);
		expect(response.headers.location).toBe("/login");
	});
});

describe("GET /job-roles/:id", () => {
	beforeEach(() => {
		mockedGetJobById.mockReset();
	});

	it("renders a formatted job role", async () => {
		mockedGetJobById.mockResolvedValueOnce({
			...createJobRole(7),
			description: "Build reliable services",
			responsibilities: "Design APIs; Review code",
			sharepointUrl: "https://example.com/apply",
			numberOfOpenPositions: 2,
		});

		const response = await request(app).get("/job-roles/7");

		expect(response.status).toBe(200);
		expect(mockedGetJobById).toHaveBeenCalledWith(7, jwtToken);
		expect(response.text).toContain("Role 7");
		expect(response.text).toContain("Open");
		expect(response.text).toContain("Design APIs");
		expect(response.text).toContain("Review code");
	});

	it("rejects a non-numeric job role ID", async () => {
		const response = await request(app).get("/job-roles/not-a-number");

		expect(response.status).toBe(400);
		expect(mockedGetJobById).not.toHaveBeenCalled();
		expect(response.text).toContain("Invalid job role ID");
	});

	it("renders not found when the job role does not exist", async () => {
		mockedGetJobById.mockResolvedValueOnce(null);

		const response = await request(app).get("/job-roles/999");

		expect(response.status).toBe(404);
		expect(mockedGetJobById).toHaveBeenCalledWith(999, jwtToken);
		expect(response.text).toContain("Job role not found");
	});

	it("renders an error page when loading a job role fails", async () => {
		mockedGetJobById.mockRejectedValueOnce(new Error("Backend unavailable"));

		const response = await request(app).get("/job-roles/7");

		expect(response.status).toBe(500);
		expect(response.text).toContain(
			"Failed to load job role details. Please try again later.",
		);
	});

	it("redirects to login when the API rejects the token", async () => {
		mockedGetJobById.mockRejectedValueOnce(new Error("Unauthorized"));

		const response = await request(app).get("/job-roles/7");

		expect(response.status).toBe(302);
		expect(response.headers.location).toBe("/login");
	});
});
