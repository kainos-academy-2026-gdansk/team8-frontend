import axios from "axios";
import { addAxiosDateTransformer } from "axios-date-transformer";

const apiClient = axios.create({
	baseURL: process.env.API_BASE_URL ?? "http://localhost:3000/api",
	headers: {
		"Content-Type": "application/json",
	},
	timeout: 5000,
});

// Apply date transformer globally to all requests
addAxiosDateTransformer(apiClient);

export default apiClient;
