import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockedPost } = vi.hoisted(() => ({
	mockedPost: vi.fn(),
}));

vi.mock("../src/config/apiClient", () => ({
	default: {
		post: mockedPost,
	},
}));

import { type LoginApiError, login } from "../src/services/authApiService";

describe("auth API service login", () => {
	const adminToken = `header.${Buffer.from(JSON.stringify({ role: "ADMIN" })).toString("base64url")}.signature`;

	beforeEach(() => {
		mockedPost.mockReset();
	});

	it("posts credentials and returns the JWT with its role", async () => {
		mockedPost.mockResolvedValueOnce({ data: { token: adminToken } });

		await expect(
			login("person@example.com", "Verysecure@pass"),
		).resolves.toEqual({ token: adminToken, role: "ADMIN" });
		expect(mockedPost).toHaveBeenCalledWith("/auth/login", {
			email: "person@example.com",
			password: "Verysecure@pass",
		});
	});

	it("preserves the backend message for invalid credentials", async () => {
		mockedPost.mockRejectedValueOnce(
			Object.assign(new Error("Unauthorized"), {
				isAxiosError: true,
				response: {
					status: 401,
					data: { error: "Invalid email or password" },
				},
			}),
		);

		await expect(login("person@example.com", "WrongPassword!")).rejects.toEqual(
			expect.objectContaining<LoginApiError>({
				statusCode: 401,
				message: "Invalid email or password",
			}),
		);
	});

	it("returns a safe message when the backend is unavailable", async () => {
		mockedPost.mockRejectedValueOnce(
			Object.assign(new Error("Server error"), {
				isAxiosError: true,
				response: { status: 500 },
			}),
		);

		await expect(
			login("person@example.com", "Verysecure@pass"),
		).rejects.toEqual(
			expect.objectContaining<LoginApiError>({
				statusCode: 500,
				message: "Unable to sign in right now. Please try again later.",
			}),
		);
	});
});
