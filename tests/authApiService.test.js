"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const { mockedPost } = vitest_1.vi.hoisted(() => ({
	mockedPost: vitest_1.vi.fn(),
}));
vitest_1.vi.mock("../src/config/apiClient", () => ({
	default: {
		post: mockedPost,
	},
}));
const authApiService_1 = require("../src/services/authApiService");
(0, vitest_1.describe)("auth API service login", () => {
	(0, vitest_1.beforeEach)(() => {
		mockedPost.mockReset();
	});
	(0, vitest_1.it)("posts credentials and returns the JWT", async () => {
		mockedPost.mockResolvedValueOnce({ data: { token: "jwt-token" } });
		await (0, vitest_1.expect)(
			(0, authApiService_1.login)("person@example.com", "Verysecure@pass"),
		).resolves.toBe("jwt-token");
		(0, vitest_1.expect)(mockedPost).toHaveBeenCalledWith("/auth/login", {
			email: "person@example.com",
			password: "Verysecure@pass",
		});
	});
	(0, vitest_1.it)(
		"preserves the backend message for invalid credentials",
		async () => {
			mockedPost.mockRejectedValueOnce(
				Object.assign(new Error("Unauthorized"), {
					isAxiosError: true,
					response: {
						status: 401,
						data: { error: "Invalid email or password" },
					},
				}),
			);
			await (0, vitest_1.expect)(
				(0, authApiService_1.login)("person@example.com", "WrongPassword!"),
			).rejects.toEqual(
				vitest_1.expect.objectContaining({
					statusCode: 401,
					message: "Invalid email or password",
				}),
			);
		},
	);
	(0, vitest_1.it)(
		"returns a safe message when the backend is unavailable",
		async () => {
			mockedPost.mockRejectedValueOnce(
				Object.assign(new Error("Server error"), {
					isAxiosError: true,
					response: { status: 500 },
				}),
			);
			await (0, vitest_1.expect)(
				(0, authApiService_1.login)("person@example.com", "Verysecure@pass"),
			).rejects.toEqual(
				vitest_1.expect.objectContaining({
					statusCode: 500,
					message: "Unable to sign in right now. Please try again later.",
				}),
			);
		},
	);
});
