import request from "supertest";
import { describe, expect, it, vi } from "vitest";

const { mockedLogin, mockedRegisterAccount, MockRegisterApiError } = vi.hoisted(() => {
	class RegisterApiError extends Error {
		statusCode: number;

		constructor(statusCode: number, message: string) {
			super(message);
			this.statusCode = statusCode;
		}
	}

	return {
		mockedLogin: vi.fn(async () => "test-jwt-token"),
		mockedRegisterAccount: vi.fn(async () => undefined),
		MockRegisterApiError: RegisterApiError,
	};
});

vi.mock("../src/services/authApiService", () => ({
	login: mockedLogin,
	registerAccount: mockedRegisterAccount,
	RegisterApiError: MockRegisterApiError,
}));

import app from "../src/app";

describe("Vitest smoke", () => {
	it("runs basic assertions", () => {
		expect(1 + 1).toBe(2);
	});

	it("responds on GET /", async () => {
		const response = await request(app).get("/");

		expect(response.status).toBe(200);
		expect(response.text).toBeTypeOf("string");
		expect(response.text).toContain("Hello world!");
	});

	it("responds on GET /register", async () => {
		const response = await request(app).get("/register");

		expect(response.status).toBe(200);
		expect(response.text).toContain("Create your account");
		expect(response.text).toContain('name="email"');
		expect(response.text).toContain('name="password"');
		expect(response.text).toContain('name="confirmPassword"');
	});

	it("responds on GET /login", async () => {
		const response = await request(app).get("/login");

		expect(response.status).toBe(200);
		expect(response.text).toContain("Sign in");
		expect(response.text).toContain('name="email"');
	});

	it("returns validation errors on invalid POST /login", async () => {
		const response = await request(app).post("/login").type("form").send({
			email: "person@example.com",
		});

		expect(response.status).toBe(400);
		expect(response.text).toContain("Enter both email and password");
		expect(mockedLogin).not.toHaveBeenCalled();
	});

	it("protects the user profile with the login session", async () => {
		const agent = request.agent(app);
		const loginResponse = await agent.post("/login").type("form").send({
			email: "person@example.com",
			password: "Verysecure@pass",
		});

		expect(loginResponse.status).toBe(302);
		expect(loginResponse.headers.location).toBe("/job-roles");
		expect(mockedLogin).toHaveBeenCalledWith(
			"person@example.com",
			"Verysecure@pass",
		);

		const profileResponse = await agent.get("/user-profile");
		expect(profileResponse.status).toBe(200);
		expect(profileResponse.text).toContain("This is a user profile");

		await agent.get("/logout").expect(302).expect("Location", "/login");
		await agent.get("/user-profile").expect(302).expect("Location", "/login");
	});

	it("returns validation errors on invalid POST /register", async () => {
		const response = await request(app).post("/register").type("form").send({
			email: "wrong",
			password: "short",
			confirmPassword: "different",
		});

		expect(response.status).toBe(400);
		expect(response.text).toContain("There is a problem");
		expect(response.text).toContain(
			"Enter an email address in the correct format",
		);
		expect(response.text).toContain("Password must be at least 8 characters");
		expect(response.text).toContain("Passwords must match");
	});

	it("returns success on valid POST /register", async () => {
		mockedRegisterAccount.mockResolvedValueOnce(undefined);

		const response = await request(app).post("/register").type("form").send({
			email: "person@example.com",
			password: "Verysecure@pass",
			confirmPassword: "Verysecure@pass",
		});

		expect(response.status).toBe(201);
		expect(response.text).toContain("Success");
		expect(response.text).toContain("Your account has been created");
		expect(mockedRegisterAccount).toHaveBeenCalledWith({
			email: "person@example.com",
			password: "Verysecure@pass",
			confirmPassword: "Verysecure@pass",
		});
	});

	it("returns backend error details from POST /register", async () => {
		mockedRegisterAccount.mockRejectedValueOnce(
			new MockRegisterApiError(409, "Email already exists"),
		);

		const response = await request(app).post("/register").type("form").send({
			email: "person@example.com",
			password: "Verysecure@pass",
			confirmPassword: "Verysecure@pass",
		});

		expect(response.status).toBe(409);
		expect(response.text).toContain("Unable to create account");
		expect(response.text).toContain("Email already exists");
	});
});
