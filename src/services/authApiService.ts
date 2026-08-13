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

export class RegisterApiError extends Error {
	constructor(
		public readonly statusCode: number,
		message: string,
	) {
		super(message);
		this.name = "RegisterApiError";
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

type LoginResponse = {
	token?: string;
	jwtToken?: string;
	accessToken?: string;
};

function extractToken(data: LoginResponse): string | null {
	return data.token ?? data.jwtToken ?? data.accessToken ?? null;
}

export async function login(username: string, password: string): Promise<string> {
	const loginPath = process.env.AUTH_LOGIN_PATH ?? "/api/login";
	console.log("Login path:", loginPath);

	try {
		const response = await apiClient.post<LoginResponse>(loginPath, {
			email: username,
			password,
		});

		const token = extractToken(response.data);
		if (!token) {
			throw new Error("Authentication succeeded but no JWT token was returned");
		}

		return token;
	} catch (error) {
		if (axios.isAxiosError(error)) {
			const status = error.response?.status;
			if (status === 400 || status === 401) {
				throw new Error("Invalid username or password");
			}
			if (status === 404) {
				throw new Error("Login endpoint not found");
			}
			if (status === 500) {
				throw new Error("Invalid username or password");
			}
		}

		throw error;
	}
}
