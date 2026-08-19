import type { APIResponse } from "@playwright/test";
import type { RegisterCredentials } from "../data/registerData";
import { BaseApiClient } from "./baseApiClient";

export class RegisterApiClient extends BaseApiClient {
	async openRegisterPage(): Promise<APIResponse> {
		return this.get("/register");
	}

	async submitRegistration(
		credentials: RegisterCredentials,
	): Promise<APIResponse> {
		return this.postForm("/register", credentials);
	}
}
