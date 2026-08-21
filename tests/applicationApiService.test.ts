import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockedPatch, mockedPost } = vi.hoisted(() => ({
	mockedPatch: vi.fn(),
	mockedPost: vi.fn(),
}));

vi.mock("../src/config/apiClient", () => ({
	default: { patch: mockedPatch, post: mockedPost },
}));

import {
	ApplicationApiError,
	hireApplication,
	rejectApplication,
	submitApplication,
} from "../src/services/applicationApiService";

const jwtToken = "test-jwt-token";

describe("application API service", () => {
	beforeEach(() => {
		mockedPatch.mockReset();
		mockedPost.mockReset();
	});

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

	it("hires an applicant", async () => {
		mockedPatch.mockResolvedValueOnce({ data: undefined });

		await hireApplication(jwtToken, 1, 2);

		expect(mockedPatch).toHaveBeenCalledWith(
			"/job-roles/1/applications/2/hire",
			undefined,
			{ headers: { Authorization: `Bearer ${jwtToken}` } },
		);
	});

	it("rejects an applicant", async () => {
		mockedPatch.mockResolvedValueOnce({ data: undefined });

		await rejectApplication(jwtToken, 1, 2);

		expect(mockedPatch).toHaveBeenCalledWith(
			"/job-roles/1/applications/2/reject",
			undefined,
			{ headers: { Authorization: `Bearer ${jwtToken}` } },
		);
	});

	it("converts a 401 response into an unauthorized error", async () => {
		const error = Object.assign(new Error("Unauthorized"), {
			isAxiosError: true,
			response: { status: 401 },
		});
		mockedPatch.mockRejectedValueOnce(error);

		await expect(hireApplication(jwtToken, 1, 2)).rejects.toThrow(
			"Unauthorized",
		);
	});

	it("surfaces the backend error message for a 409 conflict", async () => {
		const error = Object.assign(new Error("Conflict"), {
			isAxiosError: true,
			response: { status: 409, data: { error: "Application already hired" } },
		});
		mockedPatch.mockRejectedValueOnce(error);

		await expect(rejectApplication(jwtToken, 1, 2)).rejects.toThrow(
			"Application already hired",
		);
		try {
			mockedPatch.mockRejectedValueOnce(error);
			await rejectApplication(jwtToken, 1, 2);
		} catch (thrown) {
			expect(thrown).toBeInstanceOf(ApplicationApiError);
			expect((thrown as ApplicationApiError).statusCode).toBe(409);
		}
	});

	it("falls back to a generic message for a 500 response", async () => {
		const error = Object.assign(new Error("Server error"), {
			isAxiosError: true,
			response: { status: 500 },
		});
		mockedPatch.mockRejectedValueOnce(error);

		await expect(hireApplication(jwtToken, 1, 2)).rejects.toThrow(
			"Unable to hire this applicant.",
		);
	});
});
