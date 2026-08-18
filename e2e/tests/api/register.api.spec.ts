import {
	mismatchedPasswordRegistration,
	registerErrors,
} from "../../data/registerData";
import { expect, test } from "../../fixtures/testFixtures";

test.describe("Register endpoint", () => {
	test("serves the register page", async ({ registerApiClient }) => {
		const response = await registerApiClient.openRegisterPage();

		expect(response.status()).toBe(200);
	});

	test("rejects mismatched passwords with a validation error", async ({
		registerApiClient,
	}) => {
		const response = await registerApiClient.submitRegistration(
			mismatchedPasswordRegistration,
		);

		expect(response.status()).toBe(400);
		expect(await response.text()).toContain(registerErrors.passwordsMustMatch);
	});
});
