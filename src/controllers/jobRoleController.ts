import type { Request, Response } from "express";
import {
	getAllJobRoles,
	getJobById,
	formatJobRoleForView,
	formatJobRoleDetailedForView,
	buildPagination,
} from "../services/jobRoleApiService";
import {
	JOB_ROLE_BAND_OPTIONS,
	JOB_ROLE_CAPABILITY_OPTIONS,
	JOB_ROLE_STATUS_OPTIONS,
	jobRoleListQuerySchema,
} from "../models/jobRole";
import Logger from "../lib/logger";

export class JobRoleController {
	async getAll(req: Request, res: Response): Promise<void> {
		try {
			const { limit, offset, filters, isFiltered } =
				jobRoleListQuerySchema.parse(req.query);
			const activeFilters = isFiltered ? filters : undefined;
			const fetchPage = (targetOffset: number) =>
				activeFilters
					? getAllJobRoles(limit, targetOffset, activeFilters)
					: getAllJobRoles(limit, targetOffset);
			let jobRolePage = await fetchPage(offset);
			let pageError: string | undefined;
			let pagination = buildPagination(jobRolePage, activeFilters);

			if (
				jobRolePage.total > 0 &&
				jobRolePage.jobRoles.length === 0
			) {
				pageError =
					"The page you requested does not exist. Showing the nearest available results.";
				jobRolePage = await fetchPage(pagination.lastOffset);
				pagination = buildPagination(jobRolePage, activeFilters);
			}

			const jobRolesForView = jobRolePage.jobRoles.map(formatJobRoleForView);
			res.render("pages/job-role-list.njk", {
				jobRoles: jobRolesForView,
				total: jobRolePage.total,
				pagination,
				pageError,
				filters,
				isFiltered,
				capabilityOptions: JOB_ROLE_CAPABILITY_OPTIONS,
				bandOptions: JOB_ROLE_BAND_OPTIONS,
				statusOptions: JOB_ROLE_STATUS_OPTIONS,
			});
		} catch (error) {
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

			const job = await getJobById(id);

			if (!job) {
				res.status(404).render("pages/not-found.njk", {
					status: 404,
					message: "Job role not found",
				});
				return;
			}

			const jobForView = formatJobRoleDetailedForView(job);
			res.render("pages/job-role-information.njk", { job: jobForView });
		} catch (error) {
			Logger.error("Error fetching job role", { error });
			res.status(500).render("pages/error.njk", {
				status: 500,
				title: "Something went wrong",
				message: "Failed to load job role details. Please try again later.",
			});
		}
	}
}
