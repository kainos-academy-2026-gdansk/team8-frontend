import axios from "axios";
import apiClient from "../config/apiClient";
import {
	JOB_ROLES_PAGE_SIZE,
	type JobRole,
	type JobRoleDetailed,
	type JobRoleFilters,
	type JobRolePage,
	type JobRoleSort,
	type PaginatedJobRolesResponse,
	type CatalogueItem,
	type CreateJobRoleData,
} from "../models/jobRole";
import { APPLICATION_STATUS_LABELS } from "../models/application";

function authHeaders(token: string): { Authorization: string } {
	return { Authorization: `Bearer ${token}` };
}

export async function getJobRoleCatalogues(
	token: string,
): Promise<{ bands: CatalogueItem[]; capabilities: CatalogueItem[] }> {
	try {
		const [bands, capabilities] = await Promise.all([
			apiClient.get<CatalogueItem[]>("/bands", { headers: authHeaders(token) }),
			apiClient.get<CatalogueItem[]>("/capabilities", {
				headers: authHeaders(token),
			}),
		]);
		return { bands: bands.data, capabilities: capabilities.data };
	} catch (error) {
		if (axios.isAxiosError(error) && error.response?.status === 401) {
			throw new Error("Unauthorized");
		}
		throw new Error("Backend server error");
	}
}

export async function createJobRole(
	token: string,
	data: CreateJobRoleData,
): Promise<JobRoleDetailed> {
	try {
		const response = await apiClient.post<JobRoleDetailed>("/job-roles", data, {
			headers: authHeaders(token),
		});
		return response.data;
	} catch (error) {
		if (axios.isAxiosError(error)) {
			const status = error.response?.status;
			if (status === 401) throw new Error("Unauthorized");
			if (status === 400 || status === 404) {
				throw new Error(error.response?.data?.error ?? "Invalid job role data");
			}
		}
		throw new Error("Backend server error");
	}
}

const closingDateFormatter = new Intl.DateTimeFormat("en-GB", {
	day: "2-digit",
	month: "long",
	year: "numeric",
});

function appendJobRoleFilters(
	params: URLSearchParams,
	filters?: JobRoleFilters,
): void {
	if (!filters) return;
	if (filters.roleName) params.set("roleName", filters.roleName);
	if (filters.location) params.set("location", filters.location);
	if (filters.closingDateAfter) {
		params.set("closingDateAfter", filters.closingDateAfter);
	}
	if (filters.closingDateBefore) {
		params.set("closingDateBefore", filters.closingDateBefore);
	}
	for (const capability of filters.capability) {
		params.append("capability", capability);
	}
	for (const band of filters.band) params.append("band", band);
	for (const status of filters.status) params.append("status", status);
}

function appendJobRoleSort(params: URLSearchParams, sort?: JobRoleSort): void {
	if (!sort) return;
	params.set("sortBy", sort.sortBy);
	params.set("sortOrder", sort.sortOrder);
}

export function buildJobRolesListHref({
	limit,
	offset,
	filters,
	sort,
}: {
	limit: number;
	offset: number;
	filters?: JobRoleFilters;
	sort?: JobRoleSort;
}): string {
	const params = new URLSearchParams({
		limit: String(limit),
		offset: String(offset),
	});
	appendJobRoleFilters(params, filters);
	appendJobRoleSort(params, sort);
	return `/job-roles?${params.toString()}`;
}

function emptyJobRolePage(limit: number, offset: number): JobRolePage {
	return {
		jobRoles: [],
		total: 0,
		limit,
		offset,
	};
}

export async function getAllJobRoles(
	token: string,
	limit = JOB_ROLES_PAGE_SIZE,
	offset = 0,
	filters?: JobRoleFilters,
	sort?: JobRoleSort,
): Promise<JobRolePage> {
	try {
		const params = new URLSearchParams({
			limit: String(limit),
			offset: String(offset),
		});
		appendJobRoleFilters(params, filters);
		appendJobRoleSort(params, sort);
		const response = await apiClient.get<PaginatedJobRolesResponse>(
			"/job-roles",
			{ params, headers: authHeaders(token) },
		);
		const jobRoles =
			response.data.data.length > limit
				? response.data.data.slice(offset, offset + limit)
				: response.data.data;
		return {
			jobRoles,
			total: response.data.total,
			limit,
			offset,
		};
	} catch (error) {
		if (axios.isAxiosError(error)) {
			const status = error.response?.status;
			if (status === 401) throw new Error("Unauthorized");
			if (status === 404) return emptyJobRolePage(limit, offset);
			if (status === 500) throw new Error("Backend server error");
		}
		throw error;
	}
}

export interface JobRolePagination {
	currentPage: number;
	totalPages: number;
	firstOffset: number;
	previousOffset: number;
	nextOffset: number;
	lastOffset: number;
	hasPrevious: boolean;
	hasNext: boolean;
	fromItem: number;
	toItem: number;
	pageLinks: JobRolePageLink[];
	firstHref: string;
	previousHref: string;
	nextHref: string;
	lastHref: string;
}

export interface JobRolePageLink {
	page: number;
	href: string;
	isCurrent: boolean;
}

export function buildPagination(
	{
		total,
		limit,
		offset,
		jobRoles = [],
	}: Pick<JobRolePage, "total" | "limit" | "offset"> &
		Partial<Pick<JobRolePage, "jobRoles">>,
	filters?: JobRoleFilters,
	sort?: JobRoleSort,
): JobRolePagination {
	const totalPages = total > 0 ? Math.ceil(total / limit) : 0;
	const lastOffset = totalPages > 0 ? (totalPages - 1) * limit : 0;
	const currentOffset = Math.min(Math.max(offset, 0), Math.max(total - 1, 0));
	const currentPage =
		totalPages > 0
			? Math.min(Math.floor(currentOffset / limit) + 1, totalPages)
			: 0;
	const firstOffset = 0;
	const currentPageOffset = Math.max(firstOffset, (currentPage - 1) * limit);
	const previousOffset = Math.max(firstOffset, currentPageOffset - limit);
	const nextOffset = Math.min(lastOffset, currentPageOffset + limit);
	const hasPrevious = currentPage > 1;
	const hasNext = currentPage > 0 && currentPage < totalPages;
	const fromItem = total > 0 ? currentOffset + 1 : 0;
	const returnedItemCount = jobRoles.length || limit;
	const toItem =
		total > 0 ? Math.min(currentOffset + returnedItemCount, total) : 0;
	const hrefForOffset = (targetOffset: number) =>
		buildJobRolesListHref({
			limit,
			offset: targetOffset,
			filters,
			sort,
		});
	const firstPage = Math.max(1, currentPage - 1);
	const lastPage = Math.min(totalPages, currentPage + 1);
	const pageLinks = Array.from(
		{ length: Math.max(0, lastPage - firstPage + 1) },
		(_, index) => {
			const page = firstPage + index;
			return {
				page,
				href: hrefForOffset((page - 1) * limit),
				isCurrent: page === currentPage,
			};
		},
	);

	return {
		currentPage,
		totalPages,
		firstOffset,
		previousOffset,
		nextOffset,
		lastOffset,
		hasPrevious,
		hasNext,
		fromItem,
		toItem,
		pageLinks,
		firstHref: hrefForOffset(firstOffset),
		previousHref: hrefForOffset(previousOffset),
		nextHref: hrefForOffset(nextOffset),
		lastHref: hrefForOffset(lastOffset),
	};
}

export async function getJobById(
	id: number,
	token: string,
): Promise<JobRoleDetailed | null> {
	try {
		const response = await apiClient.get<JobRoleDetailed>(`/job-roles/${id}`, {
			headers: authHeaders(token),
		});
		return response.data;
	} catch (error) {
		if (axios.isAxiosError(error)) {
			const status = error.response?.status;
			if (status === 401) throw new Error("Unauthorized");
			if (status === 404) return null;
			if (status === 500) throw new Error("Backend server error");
		}
		throw error;
	}
}

export function formatJobRoleForView(jobRole: JobRole) {
	return {
		...jobRole,
		statusLabel: jobRole.status.name === "OPEN" ? "Open" : "Closed",
		closingDateLabel: closingDateFormatter.format(
			new Date(jobRole.closingDate),
		),
	};
}

export function formatJobRoleDetailedForView(job: JobRoleDetailed) {
	return {
		...job,
		statusLabel: job.status.name === "OPEN" ? "Open" : "Closed",
		closingDateLabel: closingDateFormatter.format(new Date(job.closingDate)),
		responsibilities: job.responsibilities
			.split(";")
			.map((responsibility) => responsibility.trim())
			.filter(Boolean),
		applications: (job.applications ?? []).map((application) => ({
			...application,
			statusLabel: APPLICATION_STATUS_LABELS[application.status],
			isInProgress: application.status === "IN_PROGRESS",
			hireHref: `/job-roles/${job.id}/applications/${application.id}/hire`,
			rejectHref: `/job-roles/${job.id}/applications/${application.id}/reject`,
		})),
	};
}
