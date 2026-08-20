import { createBdd } from "playwright-bdd";
import { expect, test } from "../fixtures/testFixtures";

const { Given, When, Then } = createBdd(test);

Given(
	"I am an authenticated user on the first job roles page",
	async ({
		request,
		context,
		registerApiClient,
		loginCredentials,
		jobRoleListPage,
	}) => {
		const registrationResponse = await registerApiClient.submitRegistration({
			...loginCredentials,
			confirmPassword: loginCredentials.password,
		});

		expect(registrationResponse.status()).toBe(201);

		const loginResponse = await request.post("/login", {
			form: {
				email: loginCredentials.email,
				password: loginCredentials.password,
			},
		});

		expect(loginResponse.status()).toBe(200);

		const state = await request.storageState();
		await context.addCookies(state.cookies);

		await jobRoleListPage.goto();
	},
);

Then("the job roles page is visible", async ({ jobRoleListPage }) => {
	await expect(jobRoleListPage.heading).toBeVisible();
});

Then("I scroll to the bottom of the page", async ({ jobRoleListPage }) => {
	await jobRoleListPage.scrollToBottom();
});

Then("the previous page control is disabled", async ({ jobRoleListPage }) => {
	await expect(jobRoleListPage.previousPage).toHaveAttribute(
		"aria-disabled",
		"true",
	);
});

Then("page 1 is selected", async ({ jobRoleListPage }) => {
	await expect(jobRoleListPage.currentPage).toHaveAttribute(
		"aria-current",
		"page",
	);
});

Then("the next page control is clickable", async ({ jobRoleListPage }) => {
	await expect(jobRoleListPage.nextPage).toBeEnabled();
});

When("I click the next page control", async ({ jobRoleListPage }) => {
	await jobRoleListPage.nextPage.click();
});

Then("the second job roles page is displayed", async ({ page }) => {
	await expect(page).toHaveURL(/\/job-roles\?/);
	const url = new URL(page.url());
	expect(url.searchParams.get("limit")).toBe("10");
	expect(url.searchParams.get("offset")).toBe("10");
});

Then("the second page contains job roles", async ({ page }) => {
	await expect(page.locator(".job-role-results-summary")).toContainText(
		"Showing 11 to 20",
	);
	await expect(
		page.getByRole("list", { name: "Job role listings" }),
	).toBeVisible();
});
