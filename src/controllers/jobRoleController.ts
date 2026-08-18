import type { Request, Response } from "express";
import {
	getAllJobRoles,
	getJobById,
	formatJobRoleForView,
	formatJobRoleDetailedForView,
	buildPagination,
	buildJobRolesListHref,
} from "../services/jobRoleApiService";
import {
	JOB_ROLE_BAND_OPTIONS,
	JOB_ROLE_CAPABILITY_OPTIONS,
	JOB_ROLE_SORT_KEYS,
	JOB_ROLE_STATUS_OPTIONS,
	type JobRoleFilters,
	type JobRoleSort,
	type JobRoleSortKey,
	jobRoleListQuerySchema,
} from "../models/jobRole";
import Logger from "../lib/logger";

interface JobRoleSortControl {
	key: JobRoleSortKey;
	label: string;
	href: string;
	state: "none" | "asc" | "desc";
	ariaLabel: string;
}

const SORT_CONTROL_LABELS: Record<JobRoleSortKey, string> = {
	roleName: "Role name",
	location: "Location",
	capability: "Capability",
	band: "Band",
	closingDate: "Closing date",
	status: "Status",
};

function buildNextSort(
	key: JobRoleSortKey,
	activeSort?: JobRoleSort,
): JobRoleSort | undefined {
	if (!activeSort || activeSort.sortBy !== key) {
		return { sortBy: key, sortOrder: "asc" };
	}

	if (activeSort.sortOrder === "asc") {
		return { sortBy: key, sortOrder: "desc" };
	}

	return undefined;
}

function buildSortControlAriaLabel(
	label: string,
	state: "none" | "asc" | "desc",
	nextSort?: JobRoleSort,
): string {
	if (state === "none") {
		return `Sort by ${label}, currently unsorted. Activate to sort ascending.`;
	}

	if (state === "asc") {
		return `Sort by ${label}, currently ascending. Activate to sort descending.`;
	}

	if (nextSort) {
		return `Sort by ${label}, currently descending. Activate to sort ${nextSort.sortOrder}.`;
	}

	return `Sort by ${label}, currently descending. Activate to clear sorting.`;
}

function buildSortControls(
	limit: number,
	activeFilters: JobRoleFilters | undefined,
	activeSort?: JobRoleSort,
): JobRoleSortControl[] {
	return JOB_ROLE_SORT_KEYS.map((key) => {
		const nextSort = buildNextSort(key, activeSort);
		const state = activeSort?.sortBy === key ? activeSort.sortOrder : "none";

		return {
			key,
			label: SORT_CONTROL_LABELS[key],
			href: buildJobRolesListHref({
				limit,
				offset: 0,
				filters: activeFilters,
				sort: nextSort,
			}),
			state,
			ariaLabel: buildSortControlAriaLabel(
				SORT_CONTROL_LABELS[key],
				state,
				nextSort,
			),
		};
	});
}

export class JobRoleController {
	private getJwtToken(req: Request): string {
		return req.session.jwtToken ?? "";
	}

	private handleUnauthorized(
		req: Request,
		res: Response,
		error: unknown,
	): boolean {
		if (error instanceof Error && error.message === "Unauthorized") {
			req.session.jwtToken = undefined;
			res.redirect("/login");
			return true;
		}

		return false;
	}

	async getAll(req: Request, res: Response): Promise<void> {
		try {
			const { limit, offset, filters, isFiltered, sort } =
				jobRoleListQuerySchema.parse(req.query);
			const activeFilters = isFiltered ? filters : undefined;
			const activeSort = sort;
			const jwtToken = this.getJwtToken(req);
			const fetchPage = (targetOffset: number) =>
				activeFilters && activeSort
					? getAllJobRoles(
							jwtToken,
							limit,
							targetOffset,
							activeFilters,
							activeSort,
						)
					: activeFilters
						? getAllJobRoles(jwtToken, limit, targetOffset, activeFilters)
						: activeSort
							? getAllJobRoles(
									jwtToken,
									limit,
									targetOffset,
									undefined,
									activeSort,
								)
							: getAllJobRoles(jwtToken, limit, targetOffset);
			let jobRolePage = await fetchPage(offset);
			let pageError: string | undefined;
			let pagination = buildPagination(jobRolePage, activeFilters, activeSort);

			if (jobRolePage.total > 0 && jobRolePage.jobRoles.length === 0) {
				pageError =
					"The page you requested does not exist. Showing the nearest available results.";
				jobRolePage = await fetchPage(pagination.lastOffset);
				pagination = buildPagination(jobRolePage, activeFilters, activeSort);
			}

			const jobRolesForView = jobRolePage.jobRoles.map(formatJobRoleForView);
			const sortControls = buildSortControls(limit, activeFilters, activeSort);
			const clearFiltersHref = activeSort
				? buildJobRolesListHref({
						limit,
						offset: 0,
						sort: activeSort,
					})
				: "/job-roles";
			res.render("pages/job-role-list.njk", {
				jobRoles: jobRolesForView,
				total: jobRolePage.total,
				pagination,
				pageError,
				filters,
				isFiltered,
				sort: activeSort,
				sortControls,
				clearFiltersHref,
				capabilityOptions: JOB_ROLE_CAPABILITY_OPTIONS,
				bandOptions: JOB_ROLE_BAND_OPTIONS,
				statusOptions: JOB_ROLE_STATUS_OPTIONS,
			});
		} catch (error) {
			if (this.handleUnauthorized(req, res, error)) {
				return;
			}

			Logger.error("Error fetching job roles", { error });
			res.status(500).render("pages/error.njk", {
				status: 500,
				title: "Something went wrong",
				message: "Failed to load job roles. Please try again later.",
			});
		}
	}

	async getById(req: Request, res: Response): Promise<void> {
		try {
			const id = Number(req.params.id);
			if (Number.isNaN(id)) {
				res.status(400).render("pages/error.njk", {
					status: 400,
					message: "Invalid job role ID",
				});
				return;
			}

			const job = await getJobById(id, this.getJwtToken(req));

			if (!job) {
				res.status(404).render("pages/not-found.njk", {
					status: 404,
					message: "Job role not found",
				});
				return;
			}

			const jobForView = formatJobRoleDetailedForView(job);
			const canApply =
				req.session.userRole === "USER" &&
				job.status.name === "OPEN" &&
				job.numberOfOpenPositions > 0;
			res.render("pages/job-role-information.njk", {
				job: jobForView,
				canApply,
			});
		} catch (error) {
			if (this.handleUnauthorized(req, res, error)) {
				return;
			}

			Logger.error("Error fetching job role", { error });
			res.status(500).render("pages/error.njk", {
				status: 500,
				title: "Something went wrong",
				message: "Failed to load job role details. Please try again later.",
			});
		}
	}
}
