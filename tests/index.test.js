"use strict";
var __importDefault =
	(this && this.__importDefault) ||
	((mod) => (mod && mod.__esModule ? mod : { default: mod }));
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const vitest_1 = require("vitest");
const {
	mockedLogin,
	mockedRegisterAccount,
	MockLoginApiError,
	MockRegisterApiError,
} = vitest_1.vi.hoisted(() => {
	class RegisterApiError extends Error {
		constructor(statusCode, message) {
			super(message);
			this.statusCode = statusCode;
		}
	}
	class LoginApiError extends Error {
		constructor(statusCode, message) {
			super(message);
			this.statusCode = statusCode;
		}
	}
	return {
		mockedLogin: vitest_1.vi.fn(),
		mockedRegisterAccount: vitest_1.vi.fn(async () => undefined),
		MockLoginApiError: LoginApiError,
		MockRegisterApiError: RegisterApiError,
	};
});
vitest_1.vi.mock("../src/services/authApiService", () => ({
	login: mockedLogin,
	LoginApiError: MockLoginApiError,
	registerAccount: mockedRegisterAccount,
	RegisterApiError: MockRegisterApiError,
}));
const app_1 = __importDefault(require("../src/app"));
(0, vitest_1.describe)("Vitest smoke", () => {
	(0, vitest_1.beforeEach)(() => {
		mockedLogin.mockReset();
		mockedRegisterAccount.mockReset();
		mockedRegisterAccount.mockResolvedValue(undefined);
	});
	(0, vitest_1.it)("runs basic assertions", () => {
		(0, vitest_1.expect)(1 + 1).toBe(2);
	});
	(0, vitest_1.it)("renders the public home page", async () => {
		const response = await (0, supertest_1.default)(app_1.default).get("/");
		(0, vitest_1.expect)(response.status).toBe(200);
		(0, vitest_1.expect)(response.text).toContain(
			"Find the role where you can make an impact",
		);
		(0, vitest_1.expect)(response.text).toContain("Explore job roles");
		(0, vitest_1.expect)(response.text).toContain('href="/job-roles"');
	});
	(0, vitest_1.it)(
		"redirects unauthenticated users from POST /logout",
		async () => {
			const response = await (0, supertest_1.default)(app_1.default).post(
				"/logout",
			);
			(0, vitest_1.expect)(response.status).toBe(302);
			(0, vitest_1.expect)(response.headers.location).toBe("/login");
		},
	);
	(0, vitest_1.it)("responds with health status on GET /health", async () => {
		const response = await (0, supertest_1.default)(app_1.default).get(
			"/health",
		);
		(0, vitest_1.expect)(response.status).toBe(200);
		(0, vitest_1.expect)(response.body).toEqual({
			status: "OK",
			timestamp: vitest_1.expect.any(String),
		});
	});
	(0, vitest_1.it)("renders the public login page", async () => {
		const response = await (0, supertest_1.default)(app_1.default).get(
			"/login",
		);
		(0, vitest_1.expect)(response.status).toBe(200);
		(0, vitest_1.expect)(response.text).toContain("Sign in");
		(0, vitest_1.expect)(response.text).toContain('name="email"');
		(0, vitest_1.expect)(response.text).toContain('name="password"');
		(0, vitest_1.expect)(response.text).toContain('href="/register"');
		(0, vitest_1.expect)(response.text).not.toContain("kainos-topnav");
		(0, vitest_1.expect)(response.text).not.toContain("govuk-footer");
	});
	(0, vitest_1.it)("validates required login fields", async () => {
		const response = await (0, supertest_1.default)(app_1.default)
			.post("/login")
			.type("form")
			.send({});
		(0, vitest_1.expect)(response.status).toBe(400);
		(0, vitest_1.expect)(response.text).toContain(
			"Enter both email and password",
		);
		(0, vitest_1.expect)(mockedLogin).not.toHaveBeenCalled();
	});
	(0, vitest_1.it)(
		"stores the token and grants access after login",
		async () => {
			const agent = supertest_1.default.agent(app_1.default);
			mockedLogin.mockResolvedValueOnce("jwt-token");
			const loginResponse = await agent.post("/login").type("form").send({
				email: "person@example.com",
				password: "Verysecure@pass",
			});
			const protectedResponse = await agent.get("/");
			(0, vitest_1.expect)(loginResponse.status).toBe(302);
			(0, vitest_1.expect)(loginResponse.headers.location).toBe("/job-roles");
			(0, vitest_1.expect)(mockedLogin).toHaveBeenCalledWith(
				"person@example.com",
				"Verysecure@pass",
			);
			(0, vitest_1.expect)(protectedResponse.status).toBe(200);
			(0, vitest_1.expect)(protectedResponse.text).toContain(
				"Find the role where you can make an impact",
			);
			(0, vitest_1.expect)(protectedResponse.text).toContain(
				"Explore job roles",
			);
			(0, vitest_1.expect)(protectedResponse.text).toContain('method="post"');
			(0, vitest_1.expect)(protectedResponse.text).toContain(
				'action="/logout"',
			);
			(0, vitest_1.expect)(protectedResponse.text).toContain("Log out");
		},
	);
	(0, vitest_1.it)(
		"renders invalid credential errors and preserves the email",
		async () => {
			mockedLogin.mockRejectedValueOnce(
				new MockLoginApiError(401, "Invalid email or password"),
			);
			const response = await (0, supertest_1.default)(app_1.default)
				.post("/login")
				.type("form")
				.send({
					email: "person@example.com",
					password: "WrongPassword!",
				});
			(0, vitest_1.expect)(response.status).toBe(401);
			(0, vitest_1.expect)(response.text).toContain(
				"Invalid email or password",
			);
			(0, vitest_1.expect)(response.text).toContain(
				'value="person@example.com"',
			);
		},
	);
	(0, vitest_1.it)("responds on GET /register", async () => {
		const response = await (0, supertest_1.default)(app_1.default).get(
			"/register",
		);
		(0, vitest_1.expect)(response.status).toBe(200);
		(0, vitest_1.expect)(response.text).toContain("Create your account");
		(0, vitest_1.expect)(response.text).toContain('name="email"');
		(0, vitest_1.expect)(response.text).toContain('name="password"');
		(0, vitest_1.expect)(response.text).toContain('name="confirmPassword"');
	});
	(0, vitest_1.it)(
		"returns validation errors on invalid POST /register",
		async () => {
			const response = await (0, supertest_1.default)(app_1.default)
				.post("/register")
				.type("form")
				.send({
					email: "wrong",
					password: "short",
					confirmPassword: "different",
				});
			(0, vitest_1.expect)(response.status).toBe(400);
			(0, vitest_1.expect)(response.text).toContain("There is a problem");
			(0, vitest_1.expect)(response.text).toContain(
				"Enter an email address in the correct format",
			);
			(0, vitest_1.expect)(response.text).toContain(
				"Password must be at least 8 characters",
			);
			(0, vitest_1.expect)(response.text).toContain("Passwords must match");
		},
	);
	(0, vitest_1.it)("returns success on valid POST /register", async () => {
		mockedRegisterAccount.mockResolvedValueOnce(undefined);
		const response = await (0, supertest_1.default)(app_1.default)
			.post("/register")
			.type("form")
			.send({
				email: "person@example.com",
				password: "Verysecure@pass",
				confirmPassword: "Verysecure@pass",
			});
		(0, vitest_1.expect)(response.status).toBe(201);
		(0, vitest_1.expect)(response.text).toContain("Success");
		(0, vitest_1.expect)(response.text).toContain(
			"Your account has been created",
		);
		(0, vitest_1.expect)(mockedRegisterAccount).toHaveBeenCalledWith({
			email: "person@example.com",
			password: "Verysecure@pass",
			confirmPassword: "Verysecure@pass",
		});
	});
	(0, vitest_1.it)(
		"returns backend error details from POST /register",
		async () => {
			mockedRegisterAccount.mockRejectedValueOnce(
				new MockRegisterApiError(409, "Email already exists"),
			);
			const response = await (0, supertest_1.default)(app_1.default)
				.post("/register")
				.type("form")
				.send({
					email: "person@example.com",
					password: "Verysecure@pass",
					confirmPassword: "Verysecure@pass",
				});
			(0, vitest_1.expect)(response.status).toBe(409);
			(0, vitest_1.expect)(response.text).toContain("Unable to create account");
			(0, vitest_1.expect)(response.text).toContain("Email already exists");
		},
	);
});
