import axios from "axios";
import apiClient from "../config/apiClient";

type RegisterAccountPayload = {
	email: string;
	password: string;
	confirmPassword: string;
};

type RegisterErrorResponse = {
	error?: string;
};

type LoginResponse = {
	token: string;
};

export class RegisterApiError extends Error {
	constructor(
		public readonly statusCode: number,
		message: string,
	) {
		super(message);
		this.name = "RegisterApiError";
	}
}

export class LoginApiError extends Error {
	constructor(
		public readonly statusCode: number,
		message: string,
	) {
		super(message);
		this.name = "LoginApiError";
	}
}

export async function login(email: string, password: string): Promise<string> {
	try {
		const response = await apiClient.post<LoginResponse>("/auth/login", {
			email,
			password,
		});
		return response.data.token;
	} catch (error) {
		if (axios.isAxiosError(error)) {
			const status = error.response?.status;
			const backendMessage = (
				error.response?.data as RegisterErrorResponse | undefined
			)?.error;

			if (status === 401) {
				throw new LoginApiError(
					status,
					backendMessage ?? "Invalid email or password",
				);
			}

			throw new LoginApiError(
				typeof status === "number" ? status : 502,
				"Unable to sign in right now. Please try again later.",
			);
		}

		throw error;
	}
}

export async function registerAccount(
	payload: RegisterAccountPayload,
): Promise<void> {
	try {
		await apiClient.post("/auth/register", payload);
	} catch (error) {
		if (axios.isAxiosError(error)) {
			const status = error.response?.status;
			const backendMessage = (
				error.response?.data as RegisterErrorResponse | undefined
			)?.error;

			if (typeof status === "number" && status >= 500) {
				const message =
					status >= 500
						? "Registration request failed"
						: (backendMessage ?? "Registration request failed");
				throw new RegisterApiError(status, message);
			}

			if (typeof status === "number") {
				throw new RegisterApiError(
					status,
					backendMessage ?? "Registration request failed",
				);
			}

			throw new RegisterApiError(
				502,
				"Unable to reach backend registration service",
			);
		}
		throw error;
	}
}
