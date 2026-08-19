import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockedPost } = vi.hoisted(() => ({ mockedPost: vi.fn() }));

vi.mock("../src/config/apiClient", () => ({ default: { post: mockedPost } }));

import {
	ApplicationApiError,
	submitApplication,
} from "../src/services/applicationApiService";

describe("application API service", () => {
	beforeEach(() => mockedPost.mockReset());

	it("submits only CV text with the bearer token", async () => {
		const application = {
			id: 1,
			jobRoleId: 1,
			status: "IN_PROGRESS",
			createdAt: "now",
		};
		mockedPost.mockResolvedValueOnce({ data: application });

		await expect(
			submitApplication(1, "Jane Doe", "jwt-token"),
		).resolves.toEqual(application);
		expect(mockedPost).toHaveBeenCalledWith(
			"/job-roles/1/applications",
			{ cv: "Jane Doe" },
			{ headers: { Authorization: "Bearer jwt-token" } },
		);
	});

	it.each([
		[400, "Invalid request body"],
		[409, "Application already exists for this job role"],
	])("maps backend %s errors", async (status, message) => {
		mockedPost.mockRejectedValueOnce({
			isAxiosError: true,
			response: { status, data: { error: message } },
		});

		await expect(submitApplication(1, "CV", "token")).rejects.toEqual(
			new ApplicationApiError(status, message),
		);
	});
});
