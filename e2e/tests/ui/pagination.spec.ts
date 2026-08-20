import { expect, test } from "../../fixtures/testFixtures";

test("pagination renders the next page", async ({
	request,
	context,
	registerApiClient,
	loginCredentials,
	jobRoleListPage,
	page,
}) => {
	const registrationResponse = await registerApiClient.submitRegistration({
		...loginCredentials,
		confirmPassword: loginCredentials.password,
	});

	expect(registrationResponse.status()).toBe(201);

	const loginResponse = await request.post("/login", {
		form: {
			email: loginCredentials.email,
			password: loginCredentials.password,
		},
	});

	expect(loginResponse.status()).toBe(200);

	const state = await request.storageState();
	await context.addCookies(state.cookies);

	await jobRoleListPage.goto();

	await expect(jobRoleListPage.heading).toBeVisible();
	await expect(jobRoleListPage.currentPage).toHaveAttribute(
		"aria-current",
		"page",
	);
	await expect(jobRoleListPage.nextPage).toBeEnabled();

	await jobRoleListPage.nextPage.click();

	await expect(page).toHaveURL(/\/job-roles\?/);
	const url = new URL(page.url());
	expect(url.searchParams.get("limit")).toBe("10");
	expect(url.searchParams.get("offset")).toBe("10");
	await expect(page.locator(".job-role-results-summary")).toContainText(
		"Showing 11 to 20",
	);
});
