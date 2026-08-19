"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const { mockedPost } = vitest_1.vi.hoisted(() => ({
	mockedPost: vitest_1.vi.fn(),
}));
vitest_1.vi.mock("../src/config/apiClient", () => ({
	default: { post: mockedPost },
}));
const applicationApiService_1 = require("../src/services/applicationApiService");
(0, vitest_1.describe)("application API service", () => {
	(0, vitest_1.beforeEach)(() => mockedPost.mockReset());
	(0, vitest_1.it)("submits only CV text with the bearer token", async () => {
		const application = {
			id: 1,
			jobRoleId: 1,
			status: "IN_PROGRESS",
			createdAt: "now",
		};
		mockedPost.mockResolvedValueOnce({ data: application });
		await (0, vitest_1.expect)(
			(0, applicationApiService_1.submitApplication)(
				1,
				"Jane Doe",
				"jwt-token",
			),
		).resolves.toEqual(application);
		(0, vitest_1.expect)(mockedPost).toHaveBeenCalledWith(
			"/job-roles/1/applications",
			{ cv: "Jane Doe" },
			{ headers: { Authorization: "Bearer jwt-token" } },
		);
	});
	vitest_1.it.each([
		[400, "Invalid request body"],
		[409, "Application already exists for this job role"],
	])("maps backend %s errors", async (status, message) => {
		mockedPost.mockRejectedValueOnce({
			isAxiosError: true,
			response: { status, data: { error: message } },
		});
		await (0, vitest_1.expect)(
			(0, applicationApiService_1.submitApplication)(1, "CV", "token"),
		).rejects.toEqual(
			new applicationApiService_1.ApplicationApiError(status, message),
		);
	});
});
