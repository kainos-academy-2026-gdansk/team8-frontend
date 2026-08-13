import axios from "axios";
import apiClient from "../config/apiClient";
import {
	JOB_ROLES_PAGE_SIZE,
	type JobRole,
	type JobRoleDetailed,
	type JobRolePage,
	type PaginatedJobRolesResponse,
} from "../models/jobRole";

const closingDateFormatter = new Intl.DateTimeFormat("en-GB", {
	day: "2-digit",
	month: "long",
	year: "numeric",
});

const MAX_PAGE_LINKS = 5;

function emptyJobRolePage(limit: number, offset: number): JobRolePage {
	return {
		jobRoles: [],
		total: 0,
		limit,
		offset,
	};
}

export async function getAllJobRoles(
	limit = JOB_ROLES_PAGE_SIZE,
	offset = 0,
): Promise<JobRolePage> {
	try {
		const response = await apiClient.get<PaginatedJobRolesResponse>(
			"/job-roles",
			{ params: { limit, offset } },
		);
		return {
			jobRoles: response.data.data,
			total: response.data.total,
			limit: response.data.limit,
			offset: response.data.offset,
		};
	} catch (error) {
		if (axios.isAxiosError(error)) {
			const status = error.response?.status;
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

export function buildPagination({
	total,
	limit,
	offset,
 	jobRoles = [],
}: Pick<JobRolePage, "total" | "limit" | "offset"> &
	Partial<Pick<JobRolePage, "jobRoles">>): JobRolePagination {
	const totalPages = total > 0 ? Math.ceil(total / limit) : 0;
	const lastOffset = totalPages > 0 ? (totalPages - 1) * limit : 0;
	const currentOffset = Math.min(Math.max(offset, 0), Math.max(total - 1, 0));
	const currentPage =
		totalPages > 0
			? Math.min(Math.floor(currentOffset / limit) + 1, totalPages)
			: 0;
	const firstOffset = 0;
	const previousOffset = Math.max(firstOffset, currentOffset - limit);
	const nextOffset = Math.min(lastOffset, currentOffset + limit);
	const hasPrevious = currentOffset > firstOffset;
	const hasNext = currentOffset + limit < total;
	const fromItem = total > 0 ? currentOffset + 1 : 0;
	const returnedItemCount = jobRoles.length || limit;
	const toItem = total > 0
		? Math.min(currentOffset + returnedItemCount, total)
		: 0;
	const hrefForOffset = (targetOffset: number) =>
		`/job-roles?limit=${limit}&offset=${targetOffset}`;
	const firstPage = Math.max(
		1,
		Math.min(
			currentPage - Math.floor(MAX_PAGE_LINKS / 2),
			totalPages - MAX_PAGE_LINKS + 1,
		),
	);
	const lastPage = Math.min(totalPages, firstPage + MAX_PAGE_LINKS - 1);
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

export async function getJobById(id: number): Promise<JobRoleDetailed | null> {
	try {
		const response = await apiClient.get<JobRoleDetailed>(`/job-roles/${id}`);
		return response.data;
	} catch (error) {
		if (axios.isAxiosError(error)) {
			const status = error.response?.status;
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
	};
}
