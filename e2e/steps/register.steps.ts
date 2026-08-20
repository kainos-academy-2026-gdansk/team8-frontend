import { expect } from "@playwright/test";
import { Given, Then } from "../bdd/fixtures";
import {
	VALID_PASSWORD,
	uniqueEmail,
} from "../data/registerData";

Given("I am on the registration page", async ({ world }) => {
	await world.registerPage.goto();
});

Then("I register using valid details", async ({ world }) => {
	const password = VALID_PASSWORD;
	const credentials = {
		email: uniqueEmail(),
		password,
		confirmPassword: password,
	};

	await world.registerPage.register(credentials);
});

Then("an account is successfully created", async ({ world }) => {
	await expect(world.registerPage.successMessage).toBeVisible();
});
