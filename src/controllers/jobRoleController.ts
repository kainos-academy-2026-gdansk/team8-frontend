import type { Request, Response } from "express";
import { getAllJobRoles } from "../services/jobRoleApiService.js";

export class JobRoleController {
	async getAll(req: Request, res: Response): Promise<void> {
		try {
			const jobRoles = await getAllJobRoles();
			const closingDateFormatter = new Intl.DateTimeFormat("en-GB", {
				day: "2-digit",
				month: "long",
				year: "numeric",
			});

			const jobRolesForView = jobRoles.map((jobRole) => ({
				...jobRole,
				statusLabel: jobRole.status === "OPEN" ? "Open" : "Closed",
				closingDateLabel: closingDateFormatter.format(
					new Date(jobRole.closingDate),
				),
			}));

			res.render("pages/job-role-list.njk", { jobRoles: jobRolesForView });
		} catch (error) {
			console.error("Error fetching job roles:", error);
			res.status(500).render("pages/job-role-list.njk", {
				jobRoles: [],
				error: "Failed to load job roles. Please try again later.",
			});
		}
	}
}
