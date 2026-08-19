"use strict";
var __importDefault =
	(this && this.__importDefault) ||
	((mod) => (mod && mod.__esModule ? mod : { default: mod }));
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const vitest_1 = require("vitest");
const jobRoleApiService_1 = require("../src/services/jobRoleApiService");
const jwtToken = "test-jwt-token";
const { mockedGetAllJobRoles, mockedGetJobById } = vitest_1.vi.hoisted(() => ({
	mockedGetAllJobRoles: vitest_1.vi.fn(),
	mockedGetJobById: vitest_1.vi.fn(),
}));
vitest_1.vi.mock(
	"../src/services/jobRoleApiService",
	async (importOriginal) => {
		const actual = await importOriginal();
		return {
			...actual,
			getAllJobRoles: mockedGetAllJobRoles,
			getJobById: mockedGetJobById,
		};
	},
);
vitest_1.vi.mock("../src/config/authMiddleware", () => ({
	requireAuth: (req, _res, next) => {
		req.session.jwtToken = jwtToken;
		next();
	},
}));
const app_1 = __importDefault(require("../src/app"));
function createJobRole(id) {
	return {
		id,
		roleName: `Role ${id}`,
		location: "Remote",
		capability: { id: 1, name: "Engineering" },
		band: { id: 1, name: "Consultant" },
		closingDate: new Date("2026-08-28T22:00:00.000Z"),
		status: { id: 1, name: "OPEN" },
	};
}
function createPage(offset, total = 14) {
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
(0, vitest_1.describe)("GET /job-roles pagination", () => {
	(0, vitest_1.beforeEach)(() => {
		mockedGetAllJobRoles.mockReset();
		mockedGetJobById.mockReset();
	});
	(0, vitest_1.it)(
		"loads the first ten roles and disables backward controls",
		async () => {
			mockedGetAllJobRoles.mockResolvedValueOnce(createPage(0));
			const response = await (0, supertest_1.default)(app_1.default).get(
				"/job-roles",
			);
			(0, vitest_1.expect)(response.status).toBe(200);
			(0, vitest_1.expect)(mockedGetAllJobRoles).toHaveBeenCalledWith(
				jwtToken,
				10,
				0,
			);
			(0, vitest_1.expect)(response.text).toContain(
				"Showing 1 to 10 of 14 job roles",
			);
			(0, vitest_1.expect)(response.text).toContain(
				'job-role-pagination__button--disabled" aria-disabled="true">First',
			);
			(0, vitest_1.expect)(response.text).toContain(
				'job-role-pagination__direction-link--disabled" aria-disabled="true"',
			);
			(0, vitest_1.expect)(response.text).toContain(
				'href="/job-roles?limit=10&amp;offset=10" rel="next"',
			);
			(0, vitest_1.expect)(response.text).toContain(
				'href="/job-roles?limit=10&amp;offset=10" rel="last"',
			);
			(0, vitest_1.expect)(response.text).toContain(
				'aria-label="Page 1" aria-current="page">1',
			);
			(0, vitest_1.expect)(response.text).toContain('aria-label="Page 2">2');
		},
	);
	(0, vitest_1.it)(
		"loads the next page and disables forward controls on the last page",
		async () => {
			mockedGetAllJobRoles.mockResolvedValueOnce(createPage(10));
			const response = await (0, supertest_1.default)(app_1.default).get(
				"/job-roles?limit=10&offset=10",
			);
			(0, vitest_1.expect)(response.status).toBe(200);
			(0, vitest_1.expect)(mockedGetAllJobRoles).toHaveBeenCalledWith(
				jwtToken,
				10,
				10,
			);
			(0, vitest_1.expect)(response.text).toContain(
				"Showing 11 to 14 of 14 job roles",
			);
			(0, vitest_1.expect)(response.text).toContain(
				'href="/job-roles?limit=10&amp;offset=0" rel="first">First',
			);
			(0, vitest_1.expect)(response.text).toContain(
				'href="/job-roles?limit=10&amp;offset=0" rel="prev"',
			);
			(0, vitest_1.expect)(response.text).toContain(
				'job-role-pagination__direction-link--disabled" aria-disabled="true"',
			);
			(0, vitest_1.expect)(response.text).toContain(
				'job-role-pagination__button--disabled" aria-disabled="true">Last',
			);
			(0, vitest_1.expect)(response.text).toContain(
				'aria-label="Page 2" aria-current="page">2',
			);
		},
	);
	(0, vitest_1.it)(
		"summarizes the returned item for a non-page-aligned offset",
		async () => {
			mockedGetAllJobRoles.mockResolvedValueOnce(createPage(13, 14));
			const response = await (0, supertest_1.default)(app_1.default).get(
				"/job-roles?limit=10&offset=13",
			);
			(0, vitest_1.expect)(response.status).toBe(200);
			(0, vitest_1.expect)(mockedGetAllJobRoles).toHaveBeenCalledWith(
				jwtToken,
				10,
				13,
			);
			(0, vitest_1.expect)(response.text).toContain(
				"Showing 14 to 14 of 14 job roles",
			);
		},
	);
	(0, vitest_1.it)(
		"keeps directional links aligned with numbered pages",
		() => {
			const pagination = (0, jobRoleApiService_1.buildPagination)({
				total: 35,
				limit: 10,
				offset: 13,
			});
			(0, vitest_1.expect)(pagination.currentPage).toBe(2);
			(0, vitest_1.expect)(pagination.previousOffset).toBe(0);
			(0, vitest_1.expect)(pagination.nextOffset).toBe(20);
			(0, vitest_1.expect)(pagination.previousHref).toBe(
				"/job-roles?limit=10&offset=0",
			);
			(0, vitest_1.expect)(pagination.nextHref).toBe(
				"/job-roles?limit=10&offset=20",
			);
			(0, vitest_1.expect)(pagination.hasPrevious).toBe(true);
			(0, vitest_1.expect)(pagination.hasNext).toBe(true);
		},
	);
	(0, vitest_1.it)(
		"clamps an out-of-range offset and shows an error summary",
		async () => {
			mockedGetAllJobRoles
				.mockResolvedValueOnce(createPage(20, 14))
				.mockResolvedValueOnce(createPage(10, 14));
			const response = await (0, supertest_1.default)(app_1.default).get(
				"/job-roles?limit=10&offset=20",
			);
			(0, vitest_1.expect)(response.status).toBe(200);
			(0, vitest_1.expect)(mockedGetAllJobRoles).toHaveBeenNthCalledWith(
				1,
				jwtToken,
				10,
				20,
			);
			(0, vitest_1.expect)(mockedGetAllJobRoles).toHaveBeenNthCalledWith(
				2,
				jwtToken,
				10,
				10,
			);
			(0, vitest_1.expect)(response.text).toContain("There is a problem");
			(0, vitest_1.expect)(response.text).toContain(
				"The page you requested does not exist. Showing the nearest available results.",
			);
			(0, vitest_1.expect)(response.text).toContain(
				"Showing 11 to 14 of 14 job roles",
			);
		},
	);
	(0, vitest_1.it)(
		"falls back to the fixed page size and first offset for invalid values",
		async () => {
			mockedGetAllJobRoles.mockResolvedValueOnce(createPage(0));
			const response = await (0, supertest_1.default)(app_1.default).get(
				"/job-roles?limit=25&offset=not-a-number",
			);
			(0, vitest_1.expect)(response.status).toBe(200);
			(0, vitest_1.expect)(mockedGetAllJobRoles).toHaveBeenCalledWith(
				jwtToken,
				10,
				0,
			);
		},
	);
	(0, vitest_1.it)(
		"does not render pagination for an empty result set",
		async () => {
			mockedGetAllJobRoles.mockResolvedValueOnce(createPage(0, 0));
			const response = await (0, supertest_1.default)(app_1.default).get(
				"/job-roles",
			);
			(0, vitest_1.expect)(response.status).toBe(200);
			(0, vitest_1.expect)(response.text).toContain("No job roles found.");
			(0, vitest_1.expect)(response.text).not.toContain(
				'aria-label="Pagination"',
			);
		},
	);
	(0, vitest_1.it)(
		"renders filter controls with the approved static options",
		async () => {
			mockedGetAllJobRoles.mockResolvedValueOnce(createPage(0));
			const response = await (0, supertest_1.default)(app_1.default).get(
				"/job-roles",
			);
			(0, vitest_1.expect)(response.text).toContain('name="roleName"');
			(0, vitest_1.expect)(response.text).toContain('name="location"');
			(0, vitest_1.expect)(response.text).toContain(
				'value="Software Engineering"',
			);
			(0, vitest_1.expect)(response.text).toContain('value="Director"');
			(0, vitest_1.expect)(response.text).toContain('value="OPEN"');
			(0, vitest_1.expect)(response.text).toContain('name="closingDateAfter"');
			(0, vitest_1.expect)(response.text).toContain('name="closingDateBefore"');
		},
	);
	(0, vitest_1.it)(
		"paginates filtered results and retains their values",
		async () => {
			mockedGetAllJobRoles.mockResolvedValueOnce(createPage(10, 14));
			const response = await (0, supertest_1.default)(app_1.default).get(
				"/job-roles?offset=10&roleName=Engineer&location=Gdansk&capability=Software%20Engineering&capability=Cloud&band=Consultant&status=OPEN&closingDateAfter=2026-08-01&closingDateBefore=2026-08-31",
			);
			(0, vitest_1.expect)(mockedGetAllJobRoles).toHaveBeenCalledWith(
				jwtToken,
				10,
				10,
				{
					roleName: "Engineer",
					location: "Gdansk",
					capability: ["Software Engineering", "Cloud"],
					band: ["Consultant"],
					status: ["OPEN"],
					closingDateAfter: "2026-08-01",
					closingDateBefore: "2026-08-31",
				},
			);
			(0, vitest_1.expect)(response.text).toContain('value="Engineer"');
			(0, vitest_1.expect)(response.text).toContain(
				'value="Software Engineering" checked',
			);
			(0, vitest_1.expect)(response.text).toContain('value="OPEN" checked');
			(0, vitest_1.expect)(response.text).toContain("14 job roles found");
			(0, vitest_1.expect)(response.text).toContain(
				'href="/job-roles">Clear filters</a>',
			);
			(0, vitest_1.expect)(response.text).toContain('aria-label="Pagination"');
			(0, vitest_1.expect)(response.text).toContain(
				'href="/job-roles?limit=10&amp;offset=0&amp;roleName=Engineer',
			);
		},
	);
	(0, vitest_1.it)(
		"ignores invalid filters and keeps unfiltered pagination",
		async () => {
			mockedGetAllJobRoles.mockResolvedValueOnce(createPage(0));
			const response = await (0, supertest_1.default)(app_1.default).get(
				"/job-roles?status=UNKNOWN&closingDateAfter=not-a-date",
			);
			(0, vitest_1.expect)(mockedGetAllJobRoles).toHaveBeenCalledWith(
				jwtToken,
				10,
				0,
			);
			(0, vitest_1.expect)(response.text).toContain('aria-label="Pagination"');
			(0, vitest_1.expect)(response.text).not.toContain("Clear filters");
		},
	);
	(0, vitest_1.it)(
		"shows a filter-aware empty state without pagination",
		async () => {
			mockedGetAllJobRoles.mockResolvedValueOnce(createPage(0, 0));
			const response = await (0, supertest_1.default)(app_1.default).get(
				"/job-roles?roleName=Missing",
			);
			(0, vitest_1.expect)(response.text).toContain(
				"No job roles match your filters.",
			);
			(0, vitest_1.expect)(response.text).not.toContain(
				'aria-label="Pagination"',
			);
		},
	);
	(0, vitest_1.it)(
		"renders an error page when loading job roles fails",
		async () => {
			mockedGetAllJobRoles.mockRejectedValueOnce(
				new Error("Backend unavailable"),
			);
			const response = await (0, supertest_1.default)(app_1.default).get(
				"/job-roles",
			);
			(0, vitest_1.expect)(response.status).toBe(500);
			(0, vitest_1.expect)(response.text).toContain(
				"Failed to load job roles. Please try again later.",
			);
		},
	);
	(0, vitest_1.it)(
		"redirects to login when the API rejects the token",
		async () => {
			mockedGetAllJobRoles.mockRejectedValueOnce(new Error("Unauthorized"));
			const response = await (0, supertest_1.default)(app_1.default).get(
				"/job-roles",
			);
			(0, vitest_1.expect)(response.status).toBe(302);
			(0, vitest_1.expect)(response.headers.location).toBe("/login");
		},
	);
});
(0, vitest_1.describe)("GET /job-roles/:id", () => {
	(0, vitest_1.beforeEach)(() => {
		mockedGetJobById.mockReset();
	});
	(0, vitest_1.it)("renders a formatted job role", async () => {
		mockedGetJobById.mockResolvedValueOnce({
			...createJobRole(7),
			description: "Build reliable services",
			responsibilities: "Design APIs; Review code",
			sharepointUrl: "https://example.com/apply",
			numberOfOpenPositions: 2,
		});
		const response = await (0, supertest_1.default)(app_1.default).get(
			"/job-roles/7",
		);
		(0, vitest_1.expect)(response.status).toBe(200);
		(0, vitest_1.expect)(mockedGetJobById).toHaveBeenCalledWith(7, jwtToken);
		(0, vitest_1.expect)(response.text).toContain("Role 7");
		(0, vitest_1.expect)(response.text).toContain("Open");
		(0, vitest_1.expect)(response.text).toContain("Design APIs");
		(0, vitest_1.expect)(response.text).toContain("Review code");
	});
	(0, vitest_1.it)("rejects a non-numeric job role ID", async () => {
		const response = await (0, supertest_1.default)(app_1.default).get(
			"/job-roles/not-a-number",
		);
		(0, vitest_1.expect)(response.status).toBe(400);
		(0, vitest_1.expect)(mockedGetJobById).not.toHaveBeenCalled();
		(0, vitest_1.expect)(response.text).toContain("Invalid job role ID");
	});
	(0, vitest_1.it)(
		"renders not found when the job role does not exist",
		async () => {
			mockedGetJobById.mockResolvedValueOnce(null);
			const response = await (0, supertest_1.default)(app_1.default).get(
				"/job-roles/999",
			);
			(0, vitest_1.expect)(response.status).toBe(404);
			(0, vitest_1.expect)(mockedGetJobById).toHaveBeenCalledWith(
				999,
				jwtToken,
			);
			(0, vitest_1.expect)(response.text).toContain("Job role not found");
		},
	);
	(0, vitest_1.it)(
		"renders an error page when loading a job role fails",
		async () => {
			mockedGetJobById.mockRejectedValueOnce(new Error("Backend unavailable"));
			const response = await (0, supertest_1.default)(app_1.default).get(
				"/job-roles/7",
			);
			(0, vitest_1.expect)(response.status).toBe(500);
			(0, vitest_1.expect)(response.text).toContain(
				"Failed to load job role details. Please try again later.",
			);
		},
	);
	(0, vitest_1.it)(
		"redirects to login when the API rejects the token",
		async () => {
			mockedGetJobById.mockRejectedValueOnce(new Error("Unauthorized"));
			const response = await (0, supertest_1.default)(app_1.default).get(
				"/job-roles/7",
			);
			(0, vitest_1.expect)(response.status).toBe(302);
			(0, vitest_1.expect)(response.headers.location).toBe("/login");
		},
	);
});
