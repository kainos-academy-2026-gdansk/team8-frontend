import type { Request, Response } from "express";
import {
	getAllJobRoles,
	getJobById,
	formatJobRoleForView,
	formatJobRoleDetailedForView,
	buildPagination,
	getJobRoleCatalogues,
	createJobRole,
} from "../services/jobRoleApiService";
import {
	JOB_ROLE_BAND_OPTIONS,
	JOB_ROLE_CAPABILITY_OPTIONS,
	JOB_ROLE_STATUS_OPTIONS,
	jobRoleListQuerySchema,
	createJobRoleSchema,
} from "../models/jobRole";
import Logger from "../lib/logger";

export class JobRoleController {
	private readonly createTextFields = [
		{ name: "roleName", label: "Role name" },
		{ name: "description", label: "Description", textarea: true },
		{ name: "responsibilities", label: "Responsibilities", textarea: true },
		{ name: "sharepointUrl", label: "SharePoint URL", type: "url" },
		{ name: "location", label: "Location" },
	];

	private getJwtToken(req: Request): string {
		return req.session.jwtToken ?? "";
	}

	private async loadCreateForm(req: Request) {
		return getJobRoleCatalogues(this.getJwtToken(req));
	}

	private renderCreateForm(
		res: Response,
		status: number,
		model: Record<string, unknown>,
	): void {
		res.status(status).render("pages/job-role-create.njk", {
			textFields: this.createTextFields,
			...model,
		});
	}

	async showCreate(req: Request, res: Response): Promise<void> {
		try {
			const catalogues = await this.loadCreateForm(req);
			this.renderCreateForm(res, 200, {
				...catalogues,
				values: {},
				errors: {},
				errorList: [],
			});
		} catch (error) {
			if (this.handleUnauthorized(req, res, error)) return;
			Logger.error("Error loading job role creation form", { error });
			res.status(502).render("pages/error.njk", {
				status: 502,
				message: "Failed to load job role creation form.",
			});
		}
	}

	async create(req: Request, res: Response): Promise<void> {
		const values = Object.fromEntries(
			Object.entries(req.body ?? {}).map(([key, value]) => [
				key,
				typeof value === "string" ? value.trim() : value,
			]),
		);

		try {
			const catalogues = await this.loadCreateForm(req);
			const validation = createJobRoleSchema.safeParse(values);
			if (!validation.success) {
				const fieldErrors = validation.error.flatten().fieldErrors;
				const errors = Object.fromEntries(
					Object.entries(fieldErrors).map(([field, messages]) => [
						field,
						messages?.[0],
					]),
				);
				const errorList = Object.entries(errors).map(([field, message]) => ({
					field,
					message: message as string,
				}));
				this.renderCreateForm(res, 400, {
					...catalogues,
					values,
					errors,
					errorList,
				});
				return;
			}

			const created = await createJobRole(this.getJwtToken(req), validation.data);
			res.redirect(303, `/job-roles/${created.id}`);
		} catch (error) {
			if (this.handleUnauthorized(req, res, error)) return;
			Logger.error("Error creating job role", { error });
			res.status(502).render("pages/error.njk", {
				status: 502,
				message:
					error instanceof Error ? error.message : "Failed to create job role.",
			});
		}
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

	async getAll(req: Request, res: Response): Promise<void> {
		try {
			const { limit, offset, filters, isFiltered } =
				jobRoleListQuerySchema.parse(req.query);
			const activeFilters = isFiltered ? filters : undefined;
			const jwtToken = this.getJwtToken(req);
			const fetchPage = (targetOffset: number) =>
				activeFilters
					? getAllJobRoles(jwtToken, limit, targetOffset, activeFilters)
					: getAllJobRoles(jwtToken, limit, targetOffset);
			let jobRolePage = await fetchPage(offset);
			let pageError: string | undefined;
			let pagination = buildPagination(jobRolePage, activeFilters);

			if (jobRolePage.total > 0 && jobRolePage.jobRoles.length === 0) {
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
