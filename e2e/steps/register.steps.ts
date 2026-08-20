import { expect } from "@playwright/test";
import {
	invalidEmailRegistration,
	mismatchedPasswordRegistration,
	registerErrors,
	validRegistration,
	weakPasswordRegistration,
} from "../data/registerData";
import { emptyRegistration } from "../data/registerData";
import { Given, Then, When } from "../fixtures/testFixtures";

Given("I am on the registration page", async ({ registerPage, lastResponse }) => {
	lastResponse.current = await registerPage.goto();
});

Then(
	"the registration page should respond with status {int}",
	async ({ lastResponse }, status: number) => {
		expect(lastResponse.current?.status()).toBe(status);
	},
);

Then("I should see the registration form", async ({ registerPage }) => {
	await expect(registerPage.heading).toBeVisible();
	await expect(registerPage.emailInput).toBeVisible();
	await expect(registerPage.passwordInput).toHaveAttribute("type", "password");
	await expect(registerPage.confirmPasswordInput).toHaveAttribute(
		"type",
		"password",
	);
	await expect(registerPage.submitButton).toBeEnabled();
});

When("I submit the registration form with no details", async ({ registerPage }) => {
	await registerPage.register(emptyRegistration);
});

Then(
	"I should see validation errors for email, password and confirm password",
	async ({ registerPage }) => {
		await expect(registerPage.errorSummary).toBeVisible();
		await expect(
			registerPage.summaryLink(registerErrors.emailFormat),
		).toBeVisible();
		await expect(
			registerPage.summaryLink(registerErrors.passwordRequired),
		).toBeVisible();
		await expect(
			registerPage.summaryLink(registerErrors.confirmPasswordRequired),
		).toBeVisible();
	},
);

When("I register with an invalid email format", async ({ registerPage }) => {
	await registerPage.register(invalidEmailRegistration);
});

Then("I should see an email format error", async ({ registerPage }) => {
	await expect(registerPage.emailError).toContainText(
		registerErrors.emailFormat,
	);
});

When("I register with a weak password", async ({ registerPage }) => {
	await registerPage.register(weakPasswordRegistration);
});

Then("I should see a password strength error", async ({ registerPage }) => {
	await expect(registerPage.passwordError).toContainText(
		registerErrors.passwordTooShort,
	);
});

// Submits the mismatched-password payload and captures the actual POST /register
// response, so the UI message and the API status come from the same request.
When(
	"I register with mismatched passwords",
	async ({ page, registerPage, lastResponse }) => {
		await registerPage.fillForm(mismatchedPasswordRegistration);

		const [response] = await Promise.all([
			page.waitForResponse(
				(res) =>
					res.request().method() === "POST" && res.url().endsWith("/register"),
			),
			registerPage.submit(),
		]);

		lastResponse.current = response;
	},
);

Then("I should see a passwords must match error", async ({ registerPage }) => {
	await expect(registerPage.confirmPasswordError).toContainText(
		registerErrors.passwordsMustMatch,
	);
});

Then(
	"the registration request should respond with status {int}",
	async ({ lastResponse }, status: number) => {
		expect(lastResponse.current?.status()).toBe(status);
	},
);

Then(
	"the email field should keep my submitted value",
	async ({ registerPage }) => {
		await expect(registerPage.emailInput).toHaveValue(
			validRegistration.email,
		);
	},
);

Then("the password fields should be empty", async ({ registerPage }) => {
	await expect(registerPage.passwordInput).toBeEmpty();
	await expect(registerPage.confirmPasswordInput).toBeEmpty();
});

When("I follow the link to sign in", async ({ registerPage }) => {
	await registerPage.goToLogin();
});

Then("I should be on the login page", async ({ page }) => {
	await expect(page).toHaveURL(/\/login$/);
});
