import {
	loginErrors,
	missingEmailLogin,
	missingPasswordLogin,
	unknownEmailLogin,
	wrongPasswordLogin,
} from "../../data/loginData";
import {
	uniqueEmail,
	VALID_PASSWORD,
	validRegistration,
} from "../../data/registerData";
import { expect, test } from "../../fixtures/testFixtures";

test.describe("Login endpoint", () => {
	test("serves the login page", async ({ loginApiClient }) => {
		const response = await loginApiClient.openLoginPage();

		expect(response.status()).toBe(200);
	});

	test("logs in with valid credentials and reaches the job roles page", async ({
		registerApiClient,
		loginApiClient,
	}) => {
		const email = uniqueEmail("login-valid");
		await registerApiClient.submitRegistration({ ...validRegistration, email });

		const response = await loginApiClient.submitLogin({
			email,
			password: VALID_PASSWORD,
		});

		// postForm follows the post-login redirect, so a 200 here means it landed on /job-roles.
		expect(response.ok()).toBeTruthy();
		expect(response.url()).toContain("/job-roles");
	});

	test("rejects an incorrect password", async ({
		registerApiClient,
		loginApiClient,
	}) => {
		const email = uniqueEmail("login-wrong-password");
		await registerApiClient.submitRegistration({ ...validRegistration, email });

		const response = await loginApiClient.submitLogin(
			wrongPasswordLogin(email),
		);

		expect(response.status()).toBe(401);
		expect(await response.text()).toContain('id="login-error-title"');
	});

	test("rejects an email that was never registered", async ({
		loginApiClient,
	}) => {
		const response = await loginApiClient.submitLogin(unknownEmailLogin);

		expect(response.status()).toBe(401);
		expect(await response.text()).toContain('id="login-error-title"');
	});

	test("rejects a missing password with a validation error", async ({
		loginApiClient,
	}) => {
		const response = await loginApiClient.submitLogin(missingPasswordLogin);

		expect(response.status()).toBe(400);
		expect(await response.text()).toContain(loginErrors.bothRequired);
	});

	test("rejects a missing email with a validation error", async ({
		loginApiClient,
	}) => {
		const response = await loginApiClient.submitLogin(missingEmailLogin);

		expect(response.status()).toBe(400);
		expect(await response.text()).toContain(loginErrors.bothRequired);
	});
});
