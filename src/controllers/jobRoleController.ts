import type { Request, Response } from "express";
import {
	buildPagination,
	formatJobRoleDetailedForView,
	formatJobRoleForView,
	getAllJobRoles,
	getJobById,
} from "../services/jobRoleApiService";
import { jobRolePaginationQuerySchema } from "../models/jobRole";
import Logger from "../lib/logger";

export class JobRoleController {
	private getJwtToken(req: Request): string | undefined {
		return req.session.jwtToken;
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
			const { limit, offset } = jobRolePaginationQuerySchema.parse(req.query);
			const jwtToken = this.getJwtToken(req);
			let jobRolePage = jwtToken
				? await getAllJobRoles(limit, offset, jwtToken)
				: await getAllJobRoles(limit, offset);
			let pageError: string | undefined;
			let pagination = buildPagination(jobRolePage);

			if (jobRolePage.total > 0 && jobRolePage.jobRoles.length === 0) {
				pageError =
					"The page you requested does not exist. Showing the nearest available results.";
				jobRolePage = jwtToken
					? await getAllJobRoles(limit, pagination.lastOffset, jwtToken)
					: await getAllJobRoles(limit, pagination.lastOffset);
				pagination = buildPagination(jobRolePage);
			}

			const jobRolesForView = jobRolePage.jobRoles.map(formatJobRoleForView);
			res.render("pages/job-role-list.njk", {
				jobRoles: jobRolesForView,
				total: jobRolePage.total,
				pagination,
				pageError,
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

			const jwtToken = this.getJwtToken(req);
			const job = jwtToken
				? await getJobById(id, jwtToken)
				: await getJobById(id);

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
