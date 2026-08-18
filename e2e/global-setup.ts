import type { FullConfig } from "@playwright/test";
import { request } from "@playwright/test";

async function globalSetup(config: FullConfig): Promise<void> {
	const baseURL = config.projects[0]?.use.baseURL;

	if (typeof baseURL !== "string") {
		throw new Error("Playwright baseURL is not configured.");
	}

	const api = await request.newContext({ baseURL });
	const response = await api.get("/");
	await api.dispose();

	if (!response.ok()) {
		throw new Error(`Global setup failed: GET / returned ${response.status()}`);
	}
}

export default globalSetup;
