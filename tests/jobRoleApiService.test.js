"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const { mockedGet } = vitest_1.vi.hoisted(() => ({
	mockedGet: vitest_1.vi.fn(),
}));
vitest_1.vi.mock("../src/config/apiClient", () => ({
	default: {
		get: mockedGet,
	},
}));
const jobRoleApiService_1 = require("../src/services/jobRoleApiService");
const jwtToken = "test-jwt-token";
const emptyFilters = {
	capability: [],
	band: [],
	status: [],
};
const backendPage = {
	data: [],
	total: 14,
	limit: 10,
	offset: 10,
	links: {
		first: "/api/job-roles?limit=10&offset=0",
		previous: "/api/job-roles?limit=10&offset=0",
		next: null,
		last: "/api/job-roles?limit=10&offset=10",
	},
};
(0, vitest_1.describe)("job role API service", () => {
	(0, vitest_1.beforeEach)(() => {
		mockedGet.mockReset();
	});
	(0, vitest_1.it)(
		"passes pagination parameters and maps the backend envelope",
		async () => {
			mockedGet.mockResolvedValueOnce({ data: backendPage });
			const result = await (0, jobRoleApiService_1.getAllJobRoles)(
				jwtToken,
				10,
				10,
			);
			const params = mockedGet.mock.calls[0][1].params;
			(0, vitest_1.expect)(mockedGet.mock.calls[0][0]).toBe("/job-roles");
			(0, vitest_1.expect)(mockedGet.mock.calls[0][1].headers).toEqual({
				Authorization: `Bearer ${jwtToken}`,
			});
			(0, vitest_1.expect)(params.toString()).toBe("limit=10&offset=10");
			(0, vitest_1.expect)(result).toEqual({
				jobRoles: [],
				total: 14,
				limit: 10,
				offset: 10,
			});
		},
	);
	(0, vitest_1.it)(
		"sends text and date filters using the backend query names",
		async () => {
			mockedGet.mockResolvedValueOnce({ data: backendPage });
			await (0, jobRoleApiService_1.getAllJobRoles)(jwtToken, 10, 0, {
				...emptyFilters,
				roleName: "Engineer",
				location: "Gdansk",
				closingDateAfter: "2026-08-01",
				closingDateBefore: "2026-08-31",
			});
			const params = mockedGet.mock.calls[0][1].params;
			(0, vitest_1.expect)(params.toString()).toBe(
				"limit=10&offset=0&roleName=Engineer&location=Gdansk&closingDateAfter=2026-08-01&closingDateBefore=2026-08-31",
			);
		},
	);
	(0, vitest_1.it)(
		"serializes checkbox filters as repeated query parameters",
		async () => {
			mockedGet.mockResolvedValueOnce({ data: backendPage });
			await (0, jobRoleApiService_1.getAllJobRoles)(jwtToken, 10, 0, {
				...emptyFilters,
				capability: ["Software Engineering", "Cloud"],
				band: ["Consultant", "Manager"],
				status: ["OPEN", "CLOSED"],
			});
			const params = mockedGet.mock.calls[0][1].params;
			(0, vitest_1.expect)(params.getAll("capability")).toEqual([
				"Software Engineering",
				"Cloud",
			]);
			(0, vitest_1.expect)(params.getAll("band")).toEqual([
				"Consultant",
				"Manager",
			]);
			(0, vitest_1.expect)(params.getAll("status")).toEqual(["OPEN", "CLOSED"]);
		},
	);
	(0, vitest_1.it)(
		"paginates an oversized filtered response using the requested offset",
		async () => {
			const jobRoles = Array.from({ length: 14 }, (_, index) => ({
				id: index + 1,
			}));
			mockedGet
				.mockResolvedValueOnce({
					data: { ...backendPage, data: jobRoles, offset: 0 },
				})
				.mockResolvedValueOnce({
					data: { ...backendPage, data: jobRoles, offset: 0 },
				});
			const filters = {
				...emptyFilters,
				roleName: "Engineer",
			};
			const firstPage = await (0, jobRoleApiService_1.getAllJobRoles)(
				jwtToken,
				10,
				0,
				filters,
			);
			const secondPage = await (0, jobRoleApiService_1.getAllJobRoles)(
				jwtToken,
				10,
				10,
				filters,
			);
			(0, vitest_1.expect)(firstPage.jobRoles).toHaveLength(10);
			(0, vitest_1.expect)(firstPage.jobRoles.map(({ id }) => id)).toEqual([
				1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
			]);
			(0, vitest_1.expect)(secondPage.jobRoles.map(({ id }) => id)).toEqual([
				11, 12, 13, 14,
			]);
			(0, vitest_1.expect)(secondPage).toMatchObject({
				total: 14,
				limit: 10,
				offset: 10,
			});
		},
	);
	(0, vitest_1.it)("omits empty filter values", async () => {
		mockedGet.mockResolvedValueOnce({ data: backendPage });
		await (0, jobRoleApiService_1.getAllJobRoles)(
			jwtToken,
			10,
			0,
			emptyFilters,
		);
		const params = mockedGet.mock.calls[0][1].params;
		(0, vitest_1.expect)(params.toString()).toBe("limit=10&offset=0");
	});
	(0, vitest_1.it)(
		"returns an empty page when the backend returns 404",
		async () => {
			const error = Object.assign(new Error("Not found"), {
				isAxiosError: true,
				response: { status: 404 },
			});
			mockedGet.mockRejectedValueOnce(error);
			await (0, vitest_1.expect)(
				(0, jobRoleApiService_1.getAllJobRoles)(jwtToken, 10, 0),
			).resolves.toEqual({
				jobRoles: [],
				total: 0,
				limit: 10,
				offset: 0,
			});
		},
	);
	(0, vitest_1.it)(
		"converts backend 500 responses into a service error",
		async () => {
			const error = Object.assign(new Error("Server error"), {
				isAxiosError: true,
				response: { status: 500 },
			});
			mockedGet.mockRejectedValueOnce(error);
			await (0, vitest_1.expect)(
				(0, jobRoleApiService_1.getAllJobRoles)(jwtToken, 10, 0),
			).rejects.toThrow("Backend server error");
		},
	);
	(0, vitest_1.it)(
		"converts backend 401 responses into an unauthorized error",
		async () => {
			const error = Object.assign(new Error("Unauthorized"), {
				isAxiosError: true,
				response: { status: 401 },
			});
			mockedGet.mockRejectedValueOnce(error);
			await (0, vitest_1.expect)(
				(0, jobRoleApiService_1.getAllJobRoles)(jwtToken, 10, 0),
			).rejects.toThrow("Unauthorized");
			mockedGet.mockRejectedValueOnce(error);
			await (0, vitest_1.expect)(
				(0, jobRoleApiService_1.getJobById)(7, jwtToken),
			).rejects.toThrow("Unauthorized");
		},
	);
});
(0, vitest_1.describe)("buildPagination", () => {
	(0, vitest_1.it)("builds controls for the first page", () => {
		(0, vitest_1.expect)(
			(0, jobRoleApiService_1.buildPagination)({
				total: 14,
				limit: 10,
				offset: 0,
			}),
		).toMatchObject({
			currentPage: 1,
			totalPages: 2,
			firstOffset: 0,
			previousOffset: 0,
			nextOffset: 10,
			lastOffset: 10,
			hasPrevious: false,
			hasNext: true,
			fromItem: 1,
			toItem: 10,
			pageLinks: [
				{
					page: 1,
					href: "/job-roles?limit=10&offset=0",
					isCurrent: true,
				},
				{
					page: 2,
					href: "/job-roles?limit=10&offset=10",
					isCurrent: false,
				},
			],
			firstHref: "/job-roles?limit=10&offset=0",
			previousHref: "/job-roles?limit=10&offset=0",
			nextHref: "/job-roles?limit=10&offset=10",
			lastHref: "/job-roles?limit=10&offset=10",
		});
	});
	(0, vitest_1.it)("preserves active filters in pagination links", () => {
		const pagination = (0, jobRoleApiService_1.buildPagination)(
			{ total: 24, limit: 10, offset: 0 },
			{
				roleName: "Engineer",
				capability: ["Software Engineering", "Cloud"],
				band: ["Consultant"],
				status: ["OPEN"],
			},
		);
		const nextUrl = new URL(pagination.nextHref, "http://localhost");
		(0, vitest_1.expect)(nextUrl.searchParams.get("offset")).toBe("10");
		(0, vitest_1.expect)(nextUrl.searchParams.get("roleName")).toBe("Engineer");
		(0, vitest_1.expect)(nextUrl.searchParams.getAll("capability")).toEqual([
			"Software Engineering",
			"Cloud",
		]);
		(0, vitest_1.expect)(nextUrl.searchParams.getAll("band")).toEqual([
			"Consultant",
		]);
		(0, vitest_1.expect)(nextUrl.searchParams.getAll("status")).toEqual([
			"OPEN",
		]);
	});
	(0, vitest_1.it)("disables forward controls on the last page", () => {
		(0, vitest_1.expect)(
			(0, jobRoleApiService_1.buildPagination)({
				total: 14,
				limit: 10,
				offset: 10,
			}),
		).toMatchObject({
			currentPage: 2,
			hasPrevious: true,
			hasNext: false,
			fromItem: 11,
			toItem: 14,
		});
	});
	(0, vitest_1.it)(
		"shows only the current page and its immediate neighbours",
		() => {
			const pagination = (0, jobRoleApiService_1.buildPagination)({
				total: 50,
				limit: 10,
				offset: 20,
			});
			(0, vitest_1.expect)(
				pagination.pageLinks.map(({ page }) => page),
			).toEqual([2, 3, 4]);
		},
	);
	(0, vitest_1.it)(
		"keeps numbered links within the first and last page",
		() => {
			const firstPage = (0, jobRoleApiService_1.buildPagination)({
				total: 50,
				limit: 10,
				offset: 0,
			});
			const lastPage = (0, jobRoleApiService_1.buildPagination)({
				total: 50,
				limit: 10,
				offset: 40,
			});
			(0, vitest_1.expect)(firstPage.pageLinks.map(({ page }) => page)).toEqual(
				[1, 2],
			);
			(0, vitest_1.expect)(lastPage.pageLinks.map(({ page }) => page)).toEqual([
				4, 5,
			]);
		},
	);
	(0, vitest_1.it)(
		"uses the returned item count for a non-page-aligned offset",
		() => {
			const pagination = (0, jobRoleApiService_1.buildPagination)({
				total: 14,
				limit: 10,
				offset: 13,
				jobRoles: [{}],
			});
			(0, vitest_1.expect)(pagination).toMatchObject({
				currentPage: 2,
				fromItem: 14,
				toItem: 14,
				hasNext: false,
				previousOffset: 0,
			});
		},
	);
	(0, vitest_1.it)("handles an empty result set", () => {
		(0, vitest_1.expect)(
			(0, jobRoleApiService_1.buildPagination)({
				total: 0,
				limit: 10,
				offset: 0,
			}),
		).toMatchObject({
			currentPage: 0,
			totalPages: 0,
			hasPrevious: false,
			hasNext: false,
			fromItem: 0,
			toItem: 0,
		});
	});
});
