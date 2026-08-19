import type { Request, Response } from "express";
import {
	type ApplicationFormErrors,
	validateApplicationForm,
} from "../models/applicationForm";
import { getJobById } from "../services/jobRoleApiService";
import {
	ApplicationApiError,
	hireApplication,
	rejectApplication,
	submitApplication,
} from "../services/applicationApiService";
import type { ApplicationSummaryDto } from "../models/application";
import Logger from "../lib/logger";

const APPLICATION_VIEW = "pages/job-application.njk";

const CONFIRM_VIEW = "pages/job-role-application-confirm.njk";

type ApplicationAction = "hire" | "reject";

const ACTION_LABELS: Record<ApplicationAction, string> = {
	hire: "Hire",
	reject: "Reject",
};

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

	private parseIds(
		req: Request,
	): { jobRoleId: number; applicationId: number } | null {
		const jobRoleId = Number(req.params.jobRoleId);
		const applicationId = Number(req.params.applicationId);
		if (Number.isNaN(jobRoleId) || Number.isNaN(applicationId)) return null;
		return { jobRoleId, applicationId };
	}

	private handleUnauthorized(
		req: Request,
		res: Response,
		error: unknown,
	): boolean {
		if (error instanceof Error && error.message === "Unauthorized") {
			req.session.jwtToken = undefined;
			req.session.userRole = undefined;
			res.redirect("/login");
			return true;
		}

		return false;
	}

	private async findApplication(
		jobRoleId: number,
		applicationId: number,
		token: string,
	): Promise<ApplicationSummaryDto | null> {
		const job = await getJobById(jobRoleId, token);
		const application = job?.applications?.find(
			(candidate) => candidate.id === applicationId,
		);
		return application ?? null;
	}

	private async showConfirm(
		req: Request,
		res: Response,
		action: ApplicationAction,
		errorMessage?: string,
	): Promise<void> {
		const ids = this.parseIds(req);
		if (!ids) {
			res.status(400).render("pages/error.njk", {
				status: 400,
				message: "Invalid job role or application ID",
			});
			return;
		}

		try {
			const application = await this.findApplication(
				ids.jobRoleId,
				ids.applicationId,
				this.getToken(req),
			);

			if (application?.status !== "IN_PROGRESS") {
				res.status(404).render("pages/not-found.njk", {
					status: 404,
					message: "Application not found",
				});
				return;
			}

			res.render(CONFIRM_VIEW, {
				action,
				actionLabel: ACTION_LABELS[action],
				applicantEmail: application.applicantEmail,
				actionHref: `/job-roles/${ids.jobRoleId}/applications/${ids.applicationId}/${action}`,
				cancelHref: `/job-roles/${ids.jobRoleId}`,
				errorMessage,
			});
		} catch (error) {
			if (this.handleUnauthorized(req, res, error)) return;
			Logger.error(`Error loading ${action} confirmation`, { error });
			res.status(502).render("pages/error.njk", {
				status: 502,
				message: "Failed to load the application.",
			});
		}
	}

	success(_req: Request, res: Response): void {
		res.render("pages/job-application-success.njk");
	}

	private async performAction(
		req: Request,
		res: Response,
		action: ApplicationAction,
	): Promise<void> {
		const ids = this.parseIds(req);
		if (!ids) {
			res.status(400).render("pages/error.njk", {
				status: 400,
				message: "Invalid job role or application ID",
			});
			return;
		}

		try {
			const token = this.getToken(req);
			if (action === "hire") {
				await hireApplication(token, ids.jobRoleId, ids.applicationId);
			} else {
				await rejectApplication(token, ids.jobRoleId, ids.applicationId);
			}
			res.redirect(303, `/job-roles/${ids.jobRoleId}`);
		} catch (error) {
			if (this.handleUnauthorized(req, res, error)) return;
			if (error instanceof ApplicationApiError) {
				await this.showConfirm(req, res, action, error.message);
				return;
			}
			Logger.error(`Error performing ${action} action`, { error });
			res.status(502).render("pages/error.njk", {
				status: 502,
				message: `Failed to ${action} this applicant.`,
			});
		}
	}

	async showHireConfirm(req: Request, res: Response): Promise<void> {
		await this.showConfirm(req, res, "hire");
	}

	async showRejectConfirm(req: Request, res: Response): Promise<void> {
		await this.showConfirm(req, res, "reject");
	}

	async hire(req: Request, res: Response): Promise<void> {
		await this.performAction(req, res, "hire");
	}

	async reject(req: Request, res: Response): Promise<void> {
		await this.performAction(req, res, "reject");
	}
}
