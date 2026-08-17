import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

const {
	mockedLogin,
	mockedRegisterAccount,
	MockLoginApiError,
	MockRegisterApiError,
} = vi.hoisted(() => {
	class RegisterApiError extends Error {
		statusCode: number;

		constructor(statusCode: number, message: string) {
			super(message);
			this.statusCode = statusCode;
		}
	}

	class LoginApiError extends Error {
		statusCode: number;

		constructor(statusCode: number, message: string) {
			super(message);
			this.statusCode = statusCode;
		}
	}

	return {
		mockedLogin: vi.fn(),
		mockedRegisterAccount: vi.fn(async () => undefined),
		MockLoginApiError: LoginApiError,
		MockRegisterApiError: RegisterApiError,
	};
});

vi.mock("../src/services/authApiService", () => ({
	login: mockedLogin,
	LoginApiError: MockLoginApiError,
	registerAccount: mockedRegisterAccount,
	RegisterApiError: MockRegisterApiError,
}));

import app from "../src/app";

describe("Vitest smoke", () => {
	beforeEach(() => {
		mockedLogin.mockReset();
		mockedRegisterAccount.mockReset();
		mockedRegisterAccount.mockResolvedValue(undefined);
	});

	it("runs basic assertions", () => {
		expect(1 + 1).toBe(2);
	});

	it("redirects unauthenticated users from GET /", async () => {
		const response = await request(app).get("/");

		expect(response.status).toBe(302);
		expect(response.headers.location).toBe("/login");
	});

	it.each(["/health", "/logout"])(
		"redirects unauthenticated users from GET %s",
		async (path) => {
			const response = await request(app).get(path);

			expect(response.status).toBe(302);
			expect(response.headers.location).toBe("/login");
		},
	);

	it("renders the public login page", async () => {
		const response = await request(app).get("/login");

		expect(response.status).toBe(200);
		expect(response.text).toContain("Sign in");
		expect(response.text).toContain('name="email"');
		expect(response.text).toContain('name="password"');
		expect(response.text).toContain('href="/register"');
		expect(response.text).not.toContain("kainos-topnav");
		expect(response.text).not.toContain("govuk-footer");
	});

	it("validates required login fields", async () => {
		const response = await request(app).post("/login").type("form").send({});

		expect(response.status).toBe(400);
		expect(response.text).toContain("Enter both email and password");
		expect(mockedLogin).not.toHaveBeenCalled();
	});

	it("stores the token and grants access after login", async () => {
		const agent = request.agent(app);
		mockedLogin.mockResolvedValueOnce("jwt-token");

		const loginResponse = await agent.post("/login").type("form").send({
			email: "person@example.com",
			password: "Verysecure@pass",
		});
		const protectedResponse = await agent.get("/");

		expect(loginResponse.status).toBe(302);
		expect(loginResponse.headers.location).toBe("/job-roles");
		expect(mockedLogin).toHaveBeenCalledWith(
			"person@example.com",
			"Verysecure@pass",
		);
		expect(protectedResponse.status).toBe(200);
		expect(protectedResponse.text).toContain(
			"Find the role where you can make an impact",
		);
		expect(protectedResponse.text).toContain("Explore job roles");
		expect(protectedResponse.text).toContain('href="/logout"');
		expect(protectedResponse.text).toContain("Log out");
	});

	it("renders invalid credential errors and preserves the email", async () => {
		mockedLogin.mockRejectedValueOnce(
			new MockLoginApiError(401, "Invalid email or password"),
		);

		const response = await request(app).post("/login").type("form").send({
			email: "person@example.com",
			password: "WrongPassword!",
		});

		expect(response.status).toBe(401);
		expect(response.text).toContain("Invalid email or password");
		expect(response.text).toContain('value="person@example.com"');
	});

	it("responds on GET /register", async () => {
		const response = await request(app).get("/register");

		expect(response.status).toBe(200);
		expect(response.text).toContain("Create your account");
		expect(response.text).toContain('name="email"');
		expect(response.text).toContain('name="password"');
		expect(response.text).toContain('name="confirmPassword"');
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
