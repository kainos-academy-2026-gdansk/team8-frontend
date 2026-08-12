import type { Request, Response } from "express";
import {
	getAllJobRoles,
	getJobById,
	formatJobRoleForView,
	formatJobRoleDetailedForView,
} from "../services/jobRoleApiService";

export class JobRoleController {
	async getAll(_req: Request, res: Response): Promise<void> {
		try {
			const jobRoles = await getAllJobRoles();
			const jobRolesForView = jobRoles.map(formatJobRoleForView);
			res.render("pages/job-role-list.njk", { jobRoles: jobRolesForView });
		} catch (error) {
			console.error("Error fetching job roles:", error);
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
			console.error("Error fetching job role:", error);
			res.status(500).render("pages/error.njk", {
				status: 500,
				title: "Something went wrong",
				message: "Failed to load job role details. Please try again later.",
			});
		}
	}
}
