import axios from "axios";
import apiClient from "../config/apiClient";
import type { JobRole } from "../models/jobRole";

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

export async function getJobById(id: number): Promise<JobRole | null> {
	try {
		const response = await apiClient.get<JobRole>(`/job-roles/${id}`);
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
