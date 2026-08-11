import axios from "axios";
import apiClient from "../config/apiClient.js";
import { JobRole } from "../models/jobRole.js";

export async function getAllJobRoles(): Promise<JobRole[]> {
	try {
		const response = await apiClient.get<JobRole[]>("/api/job-roles-list");
		return response.data;
	} catch (error) {
		if (axios.isAxiosError(error)) {
			const status = error.response?.status;
			if (status === 404) throw new Error("No expenses found");
			if (status === 500) throw new Error("Backend server error");
		}
		throw error;
	}
}