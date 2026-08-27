import axios from "axios";
import apiClient from "../config/apiClient";
import Logger from "../lib/logger";

type RegisterAccountPayload = {
	email: string;
	password: string;
	confirmPassword: string;
};

// The API returns `error` for handled failures and `message` for auth rejections.
type RegisterErrorResponse = {
	error?: string;
	message?: string;
};

function readBackendMessage(data: unknown): string | undefined {
	const body = data as RegisterErrorResponse | undefined;
	return body?.error ?? body?.message;
}

type LoginResponse = {
	token: string;
};

export type UserRole = "ADMIN" | "USER";

export type LoginResult = {
	token: string;
	role: UserRole;
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

function readRoleFromToken(token: string): UserRole {
	try {
		const payloadPart = token.split(".")[1];
		if (!payloadPart) throw new Error("Missing token payload");
		const payload = JSON.parse(
			Buffer.from(payloadPart, "base64url").toString("utf8"),
		) as { role?: unknown };

		if (payload.role === "ADMIN" || payload.role === "USER") {
			return payload.role;
		}
	} catch {
		// Fall through to the safe login error below.
	}

	throw new LoginApiError(
		502,
		"Unable to sign in right now. Please try again later.",
	);
}

export async function login(
	email: string,
	password: string,
): Promise<LoginResult> {
	try {
		const response = await apiClient.post<LoginResponse>("/auth/login", {
			email,
			password,
		});
		return {
			token: response.data.token,
			role: readRoleFromToken(response.data.token),
		};
	} catch (error) {
		if (axios.isAxiosError(error)) {
			const status = error.response?.status;
			const backendMessage = readBackendMessage(error.response?.data);

			Logger.error(
				`Login request to API failed: status=${status ?? "none"} message=${backendMessage ?? "none"}`,
			);

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
			const backendMessage = readBackendMessage(error.response?.data);

			Logger.error(
				`Registration request to API failed: status=${status ?? "none"} message=${backendMessage ?? "none"}`,
			);

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
