import { test as base } from "@playwright/test";
import { RegisterApiClient } from "../api/registerApiClient";
import { RegisterPage } from "../pages/registerPage";

type Fixtures = {
	registerPage: RegisterPage;
	registerApiClient: RegisterApiClient;
};

export const test = base.extend<Fixtures>({
	registerPage: async ({ page }, use) => {
		await use(new RegisterPage(page));
	},
	registerApiClient: async ({ request }, use) => {
		await use(new RegisterApiClient(request));
	},
});

export { expect } from "@playwright/test";
