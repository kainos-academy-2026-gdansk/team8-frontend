import { test as base } from "@playwright/test";
import { LoginApiClient } from "../api/loginApiClient";
import { RegisterApiClient } from "../api/registerApiClient";
import { RegisterPage } from "../pages/registerPage";

type Fixtures = {
	registerPage: RegisterPage;
	registerApiClient: RegisterApiClient;
	loginApiClient: LoginApiClient;
};

export const test = base.extend<Fixtures>({
	registerPage: async ({ page }, use) => {
		await use(new RegisterPage(page));
	},
	registerApiClient: async ({ request }, use) => {
		await use(new RegisterApiClient(request));
	},
	loginApiClient: async ({ request }, use) => {
		await use(new LoginApiClient(request));
	},
});

export { expect } from "@playwright/test";
