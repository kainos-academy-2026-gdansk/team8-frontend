import axios from "axios";
import apiClient from "../config/apiClient";
import type { JobRole, JobRoleDetailed } from "../models/jobRole";

const closingDateFormatter = new Intl.DateTimeFormat("en-GB", {
	day: "2-digit",
	month: "long",
	year: "numeric",
});

export async function getAllJobRoles(): Promise<JobRole[]> {
	try {
		const response = await apiClient.get<JobRole[]>("/job-roles");
		return response.data;
	} catch (error) {
		if (axios.isAxiosError(error)) {
			const status = error.response?.status;
			if (status === 404) return [];
			if (status === 500) throw new Error("Backend server error");
		}
		throw error;
	}
}

export async function getJobById(id: number): Promise<JobRoleDetailed | null> {
	try {
		const response = await apiClient.get<JobRoleDetailed>(`/job-roles/${id}`);
		return response.data;
	} catch (error) {
		if (axios.isAxiosError(error)) {
			const status = error.response?.status;
			if (status === 404) return null;
			if (status === 500) throw new Error("Backend server error");
		}
		throw error;
	}
}

export function formatJobRoleForView(jobRole: JobRole) {
	return {
		...jobRole,
		statusLabel: jobRole.status.name === "OPEN" ? "Open" : "Closed",
		closingDateLabel: closingDateFormatter.format(new Date(jobRole.closingDate)),
	};
}

export function formatJobRoleDetailedForView(job: JobRoleDetailed) {
	return {
		...job,
		statusLabel: job.status.name === "OPEN" ? "Open" : "Closed",
		closingDateLabel: closingDateFormatter.format(new Date(job.closingDate)),
		responsibilities: job.responsibilities
			.split(";")
			.map((responsibility) => responsibility.trim())
			.filter(Boolean),
	};
}
