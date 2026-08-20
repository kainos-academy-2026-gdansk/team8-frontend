import type { APIResponse } from "@playwright/test";
import type { RegisterCredentials } from "../data/registerData";
import { BaseApiClient } from "./baseApiClient";

export class AddJobRoleApiClient extends BaseApiClient {
    async openRegisterPage(): Promise<APIResponse> {
        return this.get("/job-roles/new");
    }

    async submitAddJobRole(
        credentials: RegisterCredentials,
    ): Promise<APIResponse> {
        return this.postForm("/register", credentials);
    }
}
