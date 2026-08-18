import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockedGet } = vi.hoisted(() => ({
	mockedGet: vi.fn(),
}));

vi.mock("../src/config/apiClient", () => ({
	default: {
		get: mockedGet,
	},
}));

import {
	buildPagination,
	getAllJobRoles,
	getJobById,
} from "../src/services/jobRoleApiService";
import type { JobRole, JobRoleFilters } from "../src/models/jobRole";

const jwtToken = "test-jwt-token";

const emptyFilters: JobRoleFilters = {
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

describe("job role API service", () => {
	beforeEach(() => {
		mockedGet.mockReset();
	});

	it("passes pagination parameters and maps the backend envelope", async () => {
		mockedGet.mockResolvedValueOnce({ data: backendPage });

		const result = await getAllJobRoles(jwtToken, 10, 10);

		const params = mockedGet.mock.calls[0][1].params as URLSearchParams;
		expect(mockedGet.mock.calls[0][0]).toBe("/job-roles");
		expect(mockedGet.mock.calls[0][1].headers).toEqual({
			Authorization: `Bearer ${jwtToken}`,
		});
		expect(params.toString()).toBe("limit=10&offset=10");
		expect(result).toEqual({
			jobRoles: [],
			total: 14,
			limit: 10,
			offset: 10,
		});
	});

	it("sends text and date filters using the backend query names", async () => {
		mockedGet.mockResolvedValueOnce({ data: backendPage });

		await getAllJobRoles(jwtToken, 10, 0, {
			...emptyFilters,
			roleName: "Engineer",
			location: "Gdansk",
			closingDateAfter: "2026-08-01",
			closingDateBefore: "2026-08-31",
		});

		const params = mockedGet.mock.calls[0][1].params as URLSearchParams;
		expect(params.toString()).toBe(
			"limit=10&offset=0&roleName=Engineer&location=Gdansk&closingDateAfter=2026-08-01&closingDateBefore=2026-08-31",
		);
	});

	it("serializes checkbox filters as repeated query parameters", async () => {
		mockedGet.mockResolvedValueOnce({ data: backendPage });

		await getAllJobRoles(jwtToken, 10, 0, {
			...emptyFilters,
			capability: ["Software Engineering", "Cloud"],
			band: ["Consultant", "Manager"],
			status: ["OPEN", "CLOSED"],
		});

		const params = mockedGet.mock.calls[0][1].params as URLSearchParams;
		expect(params.getAll("capability")).toEqual([
			"Software Engineering",
			"Cloud",
		]);
		expect(params.getAll("band")).toEqual(["Consultant", "Manager"]);
		expect(params.getAll("status")).toEqual(["OPEN", "CLOSED"]);
	});

	it("sends sort parameters when sorting is active", async () => {
		mockedGet.mockResolvedValueOnce({ data: backendPage });

		await getAllJobRoles(jwtToken, 10, 0, emptyFilters, {
			sortBy: "closingDate",
			sortOrder: "desc",
		});

		const params = mockedGet.mock.calls[0][1].params as URLSearchParams;
		expect(params.get("sortBy")).toBe("closingDate");
		expect(params.get("sortOrder")).toBe("desc");
	});

	it("paginates an oversized filtered response using the requested offset", async () => {
		const jobRoles = Array.from({ length: 14 }, (_, index) => ({
			id: index + 1,
		})) as JobRole[];
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
		const firstPage = await getAllJobRoles(jwtToken, 10, 0, filters);
		const secondPage = await getAllJobRoles(jwtToken, 10, 10, filters);

		expect(firstPage.jobRoles).toHaveLength(10);
		expect(firstPage.jobRoles.map(({ id }) => id)).toEqual([
			1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
		]);
		expect(secondPage.jobRoles.map(({ id }) => id)).toEqual([11, 12, 13, 14]);
		expect(secondPage).toMatchObject({ total: 14, limit: 10, offset: 10 });
	});

	it("omits empty filter values", async () => {
		mockedGet.mockResolvedValueOnce({ data: backendPage });

		await getAllJobRoles(jwtToken, 10, 0, emptyFilters);

		const params = mockedGet.mock.calls[0][1].params as URLSearchParams;
		expect(params.toString()).toBe("limit=10&offset=0");
	});

	it("returns an empty page when the backend returns 404", async () => {
		const error = Object.assign(new Error("Not found"), {
			isAxiosError: true,
			response: { status: 404 },
		});
		mockedGet.mockRejectedValueOnce(error);

		await expect(getAllJobRoles(jwtToken, 10, 0)).resolves.toEqual({
			jobRoles: [],
			total: 0,
			limit: 10,
			offset: 0,
		});
	});

	it("converts backend 500 responses into a service error", async () => {
		const error = Object.assign(new Error("Server error"), {
			isAxiosError: true,
			response: { status: 500 },
		});
		mockedGet.mockRejectedValueOnce(error);

		await expect(getAllJobRoles(jwtToken, 10, 0)).rejects.toThrow(
			"Backend server error",
		);
	});

	it("converts backend 401 responses into an unauthorized error", async () => {
		const error = Object.assign(new Error("Unauthorized"), {
			isAxiosError: true,
			response: { status: 401 },
		});
		mockedGet.mockRejectedValueOnce(error);

		await expect(getAllJobRoles(jwtToken, 10, 0)).rejects.toThrow(
			"Unauthorized",
		);
		mockedGet.mockRejectedValueOnce(error);
		await expect(getJobById(7, jwtToken)).rejects.toThrow("Unauthorized");
	});
});

describe("buildPagination", () => {
	it("builds controls for the first page", () => {
		expect(buildPagination({ total: 14, limit: 10, offset: 0 })).toMatchObject({
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

	it("preserves active filters in pagination links", () => {
		const pagination = buildPagination(
			{ total: 24, limit: 10, offset: 0 },
			{
				roleName: "Engineer",
				capability: ["Software Engineering", "Cloud"],
				band: ["Consultant"],
				status: ["OPEN"],
			},
		);

		const nextUrl = new URL(pagination.nextHref, "http://localhost");
		expect(nextUrl.searchParams.get("offset")).toBe("10");
		expect(nextUrl.searchParams.get("roleName")).toBe("Engineer");
		expect(nextUrl.searchParams.getAll("capability")).toEqual([
			"Software Engineering",
			"Cloud",
		]);
		expect(nextUrl.searchParams.getAll("band")).toEqual(["Consultant"]);
		expect(nextUrl.searchParams.getAll("status")).toEqual(["OPEN"]);
	});

	it("preserves active sorting in pagination links", () => {
		const pagination = buildPagination(
			{ total: 24, limit: 10, offset: 0 },
			undefined,
			{ sortBy: "roleName", sortOrder: "asc" },
		);

		const nextUrl = new URL(pagination.nextHref, "http://localhost");
		expect(nextUrl.searchParams.get("offset")).toBe("10");
		expect(nextUrl.searchParams.get("sortBy")).toBe("roleName");
		expect(nextUrl.searchParams.get("sortOrder")).toBe("asc");
	});

	it("disables forward controls on the last page", () => {
		expect(buildPagination({ total: 14, limit: 10, offset: 10 })).toMatchObject(
			{
				currentPage: 2,
				hasPrevious: true,
				hasNext: false,
				fromItem: 11,
				toItem: 14,
			},
		);
	});

	it("shows only the current page and its immediate neighbours", () => {
		const pagination = buildPagination({
			total: 50,
			limit: 10,
			offset: 20,
		});

		expect(pagination.pageLinks.map(({ page }) => page)).toEqual([2, 3, 4]);
	});

	it("keeps numbered links within the first and last page", () => {
		const firstPage = buildPagination({ total: 50, limit: 10, offset: 0 });
		const lastPage = buildPagination({ total: 50, limit: 10, offset: 40 });

		expect(firstPage.pageLinks.map(({ page }) => page)).toEqual([1, 2]);
		expect(lastPage.pageLinks.map(({ page }) => page)).toEqual([4, 5]);
	});

	it("uses the returned item count for a non-page-aligned offset", () => {
		const pagination = buildPagination({
			total: 14,
			limit: 10,
			offset: 13,
			jobRoles: [{} as JobRole],
		});

		expect(pagination).toMatchObject({
			currentPage: 2,
			fromItem: 14,
			toItem: 14,
			hasNext: false,
			previousOffset: 0,
		});
	});

	it("handles an empty result set", () => {
		expect(buildPagination({ total: 0, limit: 10, offset: 0 })).toMatchObject({
			currentPage: 0,
			totalPages: 0,
			hasPrevious: false,
			hasNext: false,
			fromItem: 0,
			toItem: 0,
		});
	});
});
