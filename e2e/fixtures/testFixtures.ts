import type { APIResponse, Response } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { test as base } from "playwright-bdd";
import { RegisterApiClient } from "../api/registerApiClient";
import {
	createLoginCredentials,
	type LoginCredentials,
} from "../data/loginData";
import { JobRoleListPage } from "../pages/jobRoleListPage";
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
	registerApiClient: RegisterApiClient;
	jobRoleListPage: JobRoleListPage;
	loginCredentials: LoginCredentials;
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
	jobRoleListPage: async ({ page }, use) => {
		await use(new JobRoleListPage(page));
	},
	registerApiClient: async ({ request }, use) => {
		await use(new RegisterApiClient(request));
	},
	loginCredentials: async ({ request: _request }, use) => {
		await use(createLoginCredentials());
	},
});

export const { Given, When, Then } = createBdd(test);

export { expect } from "@playwright/test";
