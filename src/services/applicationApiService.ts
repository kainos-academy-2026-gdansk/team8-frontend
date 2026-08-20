import axios from "axios";
import apiClient from "../config/apiClient";

export type ApplicationResponse = {
	id: number;
	jobRoleId: number;
	status: string;
	createdAt: string;
};

type ApplicationErrorResponse = { error?: string };

function authHeaders(token: string): { Authorization: string } {
	return { Authorization: `Bearer ${token}` };
}

export class ApplicationApiError extends Error {
	constructor(
		public readonly statusCode: number,
		message: string,
	) {
		super(message);
		this.name = "ApplicationApiError";
	}
}

export async function submitApplication(
	roleJobId: number,
	cv: string,
	token: string,
): Promise<ApplicationResponse> {
	try {
		const response = await apiClient.post<ApplicationResponse>(
			`/job-roles/${roleJobId}/applications`,
			{ cv },
			{ headers: authHeaders(token) },
		);
		return response.data;
	} catch (error) {
		if (!axios.isAxiosError(error)) throw error;

		const status = error.response?.status;
		if (status === 401) throw new ApplicationApiError(401, "Unauthorized");

		const backendMessage = (
			error.response?.data as ApplicationErrorResponse | undefined
		)?.error;
		if (status === 400 || status === 409) {
			throw new ApplicationApiError(
				status,
				backendMessage ?? "Unable to submit application",
			);
		}

		throw new ApplicationApiError(
			typeof status === "number" ? status : 502,
			"Unable to submit your application right now. Please try again later.",
		);
	}
}
async function patchApplication(
	token: string,
	jobRoleId: number,
	applicationId: number,
	action: "hire" | "reject",
): Promise<void> {
	try {
		await apiClient.patch(
			`/job-roles/${jobRoleId}/applications/${applicationId}/${action}`,
			undefined,
			{ headers: authHeaders(token) },
		);
	} catch (error) {
		if (axios.isAxiosError(error)) {
			const status = error.response?.status;
			const backendMessage = (
				error.response?.data as { error?: string } | undefined
			)?.error;

			if (status === 401) throw new Error("Unauthorized");
			if (typeof status === "number" && status < 500) {
				throw new ApplicationApiError(
					status,
					backendMessage ?? `Unable to ${action} this applicant.`,
				);
			}
		}
		throw new ApplicationApiError(502, `Unable to ${action} this applicant.`);
	}
}

export function hireApplication(
	token: string,
	jobRoleId: number,
	applicationId: number,
): Promise<void> {
	return patchApplication(token, jobRoleId, applicationId, "hire");
}

export function rejectApplication(
	token: string,
	jobRoleId: number,
	applicationId: number,
): Promise<void> {
	return patchApplication(token, jobRoleId, applicationId, "reject");
}
