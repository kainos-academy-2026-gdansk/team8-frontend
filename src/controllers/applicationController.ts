import type { Request, Response } from "express";
import {
	type ApplicationFormErrors,
	validateApplicationForm,
} from "../models/applicationForm";
import { getJobById } from "../services/jobRoleApiService";
import {
	ApplicationApiError,
	submitApplication,
} from "../services/applicationApiService";
import Logger from "../lib/logger";

const APPLICATION_VIEW = "pages/job-application.njk";

function renderAccessDenied(res: Response): void {
	res.status(403).render("pages/error.njk", {
		status: 403,
		title: "Access denied",
		message: "You cannot apply for this job role.",
	});
}

function parseRoleId(req: Request, res: Response): number | undefined {
	const roleId = Number(req.params.id);
	if (!Number.isInteger(roleId) || roleId <= 0) {
		res.status(400).render("pages/error.njk", {
			status: 400,
			title: "Invalid job role",
			message: "The job role ID is invalid.",
		});
		return undefined;
	}
	return roleId;
}

function renderForm(
	res: Response,
	status: number,
	roleId: number,
	cv: string,
	errors: ApplicationFormErrors = {},
	backendError?: string,
): void {
	const errorList = errors.cv ? [{ field: "cv", message: errors.cv }] : [];
	res.status(status).render(APPLICATION_VIEW, {
		roleId,
		values: { cv },
		errors,
		errorList,
		backendError,
	});
}

export class ApplicationController {
	private getToken(req: Request): string {
		return req.session.jwtToken ?? "";
	}

	private async canApply(
		req: Request,
		res: Response,
		roleId: number,
	): Promise<boolean> {
		if (req.session.userRole !== "USER") {
			renderAccessDenied(res);
			return false;
		}

		const job = await getJobById(roleId, this.getToken(req));
		if (job?.status.name !== "OPEN" || job.numberOfOpenPositions <= 0) {
			renderAccessDenied(res);
			return false;
		}
		return true;
	}

	async get(req: Request, res: Response): Promise<void> {
		const roleId = parseRoleId(req, res);
		if (roleId === undefined || !(await this.canApply(req, res, roleId)))
			return;
		renderForm(res, 200, roleId, "");
	}

	async post(req: Request, res: Response): Promise<void> {
		const roleId = parseRoleId(req, res);
		if (roleId === undefined || !(await this.canApply(req, res, roleId)))
			return;

		const cv = typeof req.body?.cv === "string" ? req.body.cv : "";
		const validation = validateApplicationForm({ cv });
		if (!validation.success) {
			renderForm(res, 400, roleId, cv, validation.errors);
			return;
		}

		try {
			await submitApplication(roleId, validation.data.cv, this.getToken(req));
			res.redirect(`/job-roles/${roleId}/applications/success`);
		} catch (error) {
			if (error instanceof ApplicationApiError && error.statusCode === 401) {
				req.session.jwtToken = undefined;
				req.session.userRole = undefined;
				res.redirect("/login");
				return;
			}

			if (error instanceof ApplicationApiError) {
				renderForm(
					res,
					error.statusCode >= 400 && error.statusCode < 500
						? error.statusCode
						: 502,
					roleId,
					cv,
					{},
					error.message,
				);
				return;
			}

			Logger.error("Error submitting job application", { error });
			renderForm(
				res,
				502,
				roleId,
				cv,
				{},
				"Unable to submit your application right now. Please try again later.",
			);
		}
	}

	success(_req: Request, res: Response): void {
		res.render("pages/job-application-success.njk");
	}
}
