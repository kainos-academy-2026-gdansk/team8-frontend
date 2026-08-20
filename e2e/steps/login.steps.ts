import { expect } from "@playwright/test";
import {
	emptyLogin,
	loginErrors,
	missingEmailLogin,
	missingPasswordLogin,
	type LoginCredentials,
} from "../data/loginData";
import { Given, Then, When } from "../fixtures/testFixtures";
import type { LoginPage } from "../pages/loginPage";
import type { Page } from "@playwright/test";

Given("I am on the login page", async ({ loginPage, lastResponse }) => {
	lastResponse.current = await loginPage.goto();
});

Then("I should see the sign-in form", async ({ loginPage }) => {
	await expect(loginPage.heading).toBeVisible();
	await expect(loginPage.emailInput).toBeVisible();
	await expect(loginPage.passwordInput).toHaveAttribute("type", "password");
	await expect(loginPage.submitButton).toBeEnabled();
});

// Submits the given credentials and captures the frontend's own POST /login response,
// so the same request backs both the UI assertion and the API assertion below.
async function submitAndCaptureResponse(
	page: Page,
	loginPage: LoginPage,
	credentials: LoginCredentials,
) {
	await loginPage.fillForm(credentials);

	const [response] = await Promise.all([
		page.waitForResponse(
			(res) =>
				res.request().method() === "POST" && res.url().endsWith("/login"),
		),
		loginPage.submit(),
	]);

	return response;
}

When("I sign in without an email", async ({ page, loginPage, lastResponse }) => {
	lastResponse.current = await submitAndCaptureResponse(
		page,
		loginPage,
		missingEmailLogin,
	);
});

When(
	"I sign in without a password",
	async ({ page, loginPage, lastResponse }) => {
		lastResponse.current = await submitAndCaptureResponse(
			page,
			loginPage,
			missingPasswordLogin,
		);
	},
);

When("I sign in with no details", async ({ page, loginPage, lastResponse }) => {
	lastResponse.current = await submitAndCaptureResponse(
		page,
		loginPage,
		emptyLogin,
	);
});

Then('I should see a "both fields required" error', async ({ loginPage }) => {
	await expect(
		loginPage.summaryLink(loginErrors.bothRequired),
	).toBeVisible();
});

Then(
	"the login request should respond with status {int}",
	async ({ lastResponse }, status: number) => {
		expect(lastResponse.current?.status()).toBe(status);
	},
);
