import { expect } from "@playwright/test";
import { Given, Then } from "../bdd/fixtures";

Given("I am on the login page", async ({ world }) => {
	await world.loginPage.goto();
});

Then("I can see the login form", async ({ world }) => {
	await expect(world.loginPage.heading).toBeVisible();
	await expect(world.loginPage.emailInput).toBeVisible();
	await expect(world.loginPage.passwordInput).toBeVisible();
});

Then(
	"I fill in the login form with email {string} and password {string}",
	async ({ world }, email: string, password: string) => {
		await world.loginPage.fillForm(email, password);
	},
);

Then("I submit the login form", async ({ world }) => {
	await world.loginPage.submit();
});

Then("I should be redirected to the job roles page", async ({ page }) => {
	await expect(page).toHaveURL(/\/job-roles(?:\?.*)?$/);
});
