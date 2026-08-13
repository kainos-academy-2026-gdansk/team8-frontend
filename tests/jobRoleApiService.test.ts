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
} from "../src/services/jobRoleApiService";
import type { JobRole, JobRoleFilters } from "../src/models/jobRole";

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

		const result = await getAllJobRoles(10, 10);

		const params = mockedGet.mock.calls[0][1].params as URLSearchParams;
		expect(mockedGet.mock.calls[0][0]).toBe("/job-roles");
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

		await getAllJobRoles(10, 0, {
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

		await getAllJobRoles(10, 0, {
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

	it("omits empty filter values", async () => {
		mockedGet.mockResolvedValueOnce({ data: backendPage });

		await getAllJobRoles(10, 0, emptyFilters);

		const params = mockedGet.mock.calls[0][1].params as URLSearchParams;
		expect(params.toString()).toBe("limit=10&offset=0");
	});

	it("returns an empty page when the backend returns 404", async () => {
		const error = Object.assign(new Error("Not found"), {
			isAxiosError: true,
			response: { status: 404 },
		});
		mockedGet.mockRejectedValueOnce(error);

		await expect(getAllJobRoles(10, 0)).resolves.toEqual({
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

		await expect(getAllJobRoles(10, 0)).rejects.toThrow("Backend server error");
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

	it("bounds numbered links for large result sets", () => {
		const pagination = buildPagination({
			total: 1_000_000,
			limit: 10,
			offset: 500_000,
		});

		expect(pagination.pageLinks).toHaveLength(5);
		expect(pagination.pageLinks).toContainEqual({
			page: pagination.currentPage,
			href: `/job-roles?limit=10&offset=${pagination.currentPage * 10 - 10}`,
			isCurrent: true,
		});
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
