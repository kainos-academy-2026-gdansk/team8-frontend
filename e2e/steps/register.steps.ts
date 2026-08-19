import { expect } from "@playwright/test";
import { Given, Then } from "../bdd/fixtures";

Given("I am on the registration page", async ({ world }) => {
	await world.registerPage.goto();
});

Then("I can see the registration form", async ({ world }) => {
	await expect(world.registerPage.heading).toBeVisible();
	await expect(world.registerPage.emailInput).toBeVisible();
});

Then("the password fields are hidden", async ({ world }) => {
	await expect(world.registerPage.passwordInput).toHaveAttribute(
		"type",
		"password",
	);
	await expect(world.registerPage.confirmPasswordInput).toHaveAttribute(
		"type",
		"password",
	);
});

Then("the create account button is enabled", async ({ world }) => {
	await expect(world.registerPage.submitButton).toBeEnabled();
});
