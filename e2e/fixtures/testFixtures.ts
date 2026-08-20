import { test as base } from "@playwright/test";
import { RegisterApiClient } from "../api/registerApiClient";
import { LoginPage } from "../pages/loginPage";
import { RegisterPage } from "../pages/registerPage";

type Fixtures = {
	registerPage: RegisterPage;
	registerApiClient: RegisterApiClient;
	loginPage: LoginPage;
};

export const test = base.extend<Fixtures>({
	registerPage: async ({ page }, use) => {
		await use(new RegisterPage(page));
	},
	registerApiClient: async ({ request }, use) => {
		await use(new RegisterApiClient(request));
	},
	loginPage: async ({ page }, use) => {
		await use(new LoginPage(page));
	},
});

export { expect } from "@playwright/test";
