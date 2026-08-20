import { expect, test } from "../../fixtures/testFixtures";

test("renders the login form", async ({ loginPage }) => {
	await loginPage.goto();

	await expect(loginPage.heading).toBeVisible();
	await expect(loginPage.emailInput).toHaveAttribute("type", "email");
	await expect(loginPage.passwordInput).toHaveAttribute("type", "password");
	await expect(loginPage.submitButton).toBeEnabled();
});
