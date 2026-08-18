import {
	emptyRegistration,
	invalidEmailRegistration,
	mismatchedPasswordRegistration,
	registerErrors,
	validRegistration,
	weakPasswordRegistration,
} from "../../data/registerData";
import { expect, test } from "../../fixtures/testFixtures";

test.describe("Register page", () => {
	test.beforeEach(async ({ registerPage }) => {
		await registerPage.goto();
	});

	test("renders the registration form", async ({ registerPage }) => {
		await expect(registerPage.heading).toBeVisible();
		await expect(registerPage.emailInput).toBeVisible();
		await expect(registerPage.passwordInput).toHaveAttribute(
			"type",
			"password",
		);
		await expect(registerPage.confirmPasswordInput).toHaveAttribute(
			"type",
			"password",
		);
		await expect(registerPage.submitButton).toBeEnabled();
	});

	test("shows an error for every empty field on submit", async ({
		registerPage,
	}) => {
		await registerPage.register(emptyRegistration);

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
	});

	test("shows an error for an invalid email format", async ({
		registerPage,
	}) => {
		await registerPage.register(invalidEmailRegistration);

		await expect(registerPage.emailError).toContainText(
			registerErrors.emailFormat,
		);
	});

	test("shows an error for a password that is too weak", async ({
		registerPage,
	}) => {
		await registerPage.register(weakPasswordRegistration);

		await expect(registerPage.passwordError).toContainText(
			registerErrors.passwordTooShort,
		);
	});

	test("shows an error when the passwords do not match", async ({
		registerPage,
	}) => {
		await registerPage.register(mismatchedPasswordRegistration);

		await expect(registerPage.confirmPasswordError).toContainText(
			registerErrors.passwordsMustMatch,
		);
	});

	test("keeps the submitted email but clears the passwords after an error", async ({
		registerPage,
	}) => {
		await registerPage.register(mismatchedPasswordRegistration);

		await expect(registerPage.emailInput).toHaveValue(validRegistration.email);
		await expect(registerPage.passwordInput).toBeEmpty();
		await expect(registerPage.confirmPasswordInput).toBeEmpty();
	});

	test("links back to the login page", async ({ page, registerPage }) => {
		await registerPage.goToLogin();

		await expect(page).toHaveURL(/\/login$/);
	});
});
