import { Request, Response } from "express";
import { JobRoleService } from "../services/jobRoleService";

export class JobRoleController {
    constructor(private jobRoleService: JobRoleService = new JobRoleService()) {}

    async getAll(req: Request, res: Response): Promise<void> {
        try {
            const jobRoles = await this.jobRoleService.getAllRoles();
            const closingDateFormatter = new Intl.DateTimeFormat("en-GB", {
                day: "2-digit",
                month: "long",
                year: "numeric",
            });

            const jobRolesForView = jobRoles.map((jobRole) => ({
                ...jobRole,
                statusLabel: jobRole.status === "OPEN" ? "Open" : "Closed",
                closingDateLabel: closingDateFormatter.format(jobRole.closingDate),
            }));

            res.render("pages/job-role-list.njk", { jobRoles: jobRolesForView });
		} catch (error) {
			// this.renderApiError(res, error);
            console.log("error");
		}
    }
}
