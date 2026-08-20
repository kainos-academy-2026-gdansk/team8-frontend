import {
	emptyLogin,
	loginErrors,
	missingEmailLogin,
	missingPasswordLogin,
} from "../../data/loginData";
import { expect, test } from "../../fixtures/testFixtures";

test.describe("Login page", () => {
	test.beforeEach(async ({ loginPage }) => {
		await loginPage.goto();
	});

	test("renders the sign-in form", async ({ loginPage }) => {
		await expect(loginPage.heading).toBeVisible();
		await expect(loginPage.emailInput).toBeVisible();
		await expect(loginPage.passwordInput).toHaveAttribute("type", "password");
		await expect(loginPage.submitButton).toBeEnabled();
	});

	test("rejects a missing email in both the UI and the underlying API response", async ({
		page,
		loginPage,
	}) => {
		await loginPage.fillForm(missingEmailLogin);

		const [response] = await Promise.all([
			page.waitForResponse(
				(res) => res.request().method() === "POST" && res.url().endsWith("/login"),
			),
			loginPage.submit(),
		]);

		expect(response.status()).toBe(400);
		await expect(
			loginPage.summaryLink(loginErrors.bothRequired),
		).toBeVisible();
	});

	test("rejects a missing password in both the UI and the underlying API response", async ({
		page,
		loginPage,
	}) => {
		await loginPage.fillForm(missingPasswordLogin);

		const [response] = await Promise.all([
			page.waitForResponse(
				(res) => res.request().method() === "POST" && res.url().endsWith("/login"),
			),
			loginPage.submit(),
		]);

		expect(response.status()).toBe(400);
		await expect(
			loginPage.summaryLink(loginErrors.bothRequired),
		).toBeVisible();
	});

	test("rejects an empty form in both the UI and the underlying API response", async ({
		page,
		loginPage,
	}) => {
		await loginPage.fillForm(emptyLogin);

		const [response] = await Promise.all([
			page.waitForResponse(
				(res) => res.request().method() === "POST" && res.url().endsWith("/login"),
			),
			loginPage.submit(),
		]);

		expect(response.status()).toBe(400);
		await expect(
			loginPage.summaryLink(loginErrors.bothRequired),
		).toBeVisible();
	});
});
