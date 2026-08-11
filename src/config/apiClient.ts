import axios from "axios";

const apiClient = axios.create({
	baseURL: process.env.API_BASE_URL ?? "http://localhost:3000/api",
	headers: {
		"Content-Type": "application/json",
	},
	timeout: 5000,
});

export default apiClient;
