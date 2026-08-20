import type { APIResponse, Response } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { test as base } from "playwright-bdd";
import { LoginPage } from "../pages/loginPage";
import { RegisterPage } from "../pages/registerPage";

// Holds the most recent network response so BDD steps can share it across Given/When/Then.
type LastResponse = {
	current: Response | APIResponse | null;
};

type Fixtures = {
	registerPage: RegisterPage;
	loginPage: LoginPage;
	lastResponse: LastResponse;
};

export const test = base.extend<Fixtures>({
	registerPage: async ({ page }, use) => {
		await use(new RegisterPage(page));
	},
	loginPage: async ({ page }, use) => {
		await use(new LoginPage(page));
	},
	// biome-ignore lint/correctness/noEmptyPattern: Playwright/playwright-bdd require destructuring here to detect fixture deps.
	lastResponse: async ({}, use) => {
		await use({ current: null });
	},
});

export const { Given, When, Then } = createBdd(test);

export { expect } from "@playwright/test";
