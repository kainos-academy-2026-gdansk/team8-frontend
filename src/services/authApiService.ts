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
