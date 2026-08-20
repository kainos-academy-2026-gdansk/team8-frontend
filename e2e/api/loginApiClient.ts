import type { APIResponse } from "@playwright/test";
import type { LoginCredentials } from "../data/loginData";
import { BaseApiClient } from "./baseApiClient";

export class LoginApiClient extends BaseApiClient {
	async openLoginPage(): Promise<APIResponse> {
		return this.get("/login");
	}

	async submitLogin(credentials: LoginCredentials): Promise<APIResponse> {
		return this.postForm("/login", credentials);
	}
}
