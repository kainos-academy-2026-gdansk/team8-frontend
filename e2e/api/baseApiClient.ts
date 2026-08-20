import type { APIRequestContext, APIResponse } from "@playwright/test";

export class BaseApiClient {
	constructor(private readonly request: APIRequestContext) {}

	protected async get(path: string): Promise<APIResponse> {
		return this.request.get(path);
	}

	protected async post(
		path: string,
		payload: Record<string, unknown>,
	): Promise<APIResponse> {
		return this.request.post(path, { data: payload });
	}

	// The Express app renders forms, so it expects urlencoded bodies rather than JSON.
	protected async postForm(
		path: string,
		payload: Record<string, string>,
	): Promise<APIResponse> {
		return this.request.post(path, { form: payload });
	}
}
