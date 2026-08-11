import axios from "axios";

const apiClient = axios.create({
	baseURL: process.env.API_BASE_URL ?? "http://localhost:3001",
	headers: {
		"Content-Type": "application/json",
	},
	timeout: 5000,
});

export default apiClient;
