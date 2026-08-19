"use strict";
var __createBinding =
	(this && this.__createBinding) ||
	(Object.create
		? (o, m, k, k2) => {
				if (k2 === undefined) k2 = k;
				var desc = Object.getOwnPropertyDescriptor(m, k);
				if (
					!desc ||
					("get" in desc ? !m.__esModule : desc.writable || desc.configurable)
				) {
					desc = { enumerable: true, get: () => m[k] };
				}
				Object.defineProperty(o, k2, desc);
			}
		: (o, m, k, k2) => {
				if (k2 === undefined) k2 = k;
				o[k2] = m[k];
			});
var __setModuleDefault =
	(this && this.__setModuleDefault) ||
	(Object.create
		? (o, v) => {
				Object.defineProperty(o, "default", { enumerable: true, value: v });
			}
		: (o, v) => {
				o["default"] = v;
			});
var __importStar =
	(this && this.__importStar) ||
	(() => {
		var ownKeys = (o) => {
			ownKeys =
				Object.getOwnPropertyNames ||
				((o) => {
					var ar = [];
					for (var k in o) if (Object.hasOwn(o, k)) ar[ar.length] = k;
					return ar;
				});
			return ownKeys(o);
		};
		return (mod) => {
			if (mod && mod.__esModule) return mod;
			var result = {};
			if (mod != null)
				for (var k = ownKeys(mod), i = 0; i < k.length; i++)
					if (k[i] !== "default") __createBinding(result, mod, k[i]);
			__setModuleDefault(result, mod);
			return result;
		};
	})();
var __importDefault =
	(this && this.__importDefault) ||
	((mod) => (mod && mod.__esModule ? mod : { default: mod }));
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const vitest_1 = require("vitest");
const { mockedGetJobById, mockedSubmitApplication } = vitest_1.vi.hoisted(
	() => ({
		mockedGetJobById: vitest_1.vi.fn(),
		mockedSubmitApplication: vitest_1.vi.fn(),
	}),
);
let currentRole = "USER";
vitest_1.vi.mock(
	"../src/services/jobRoleApiService",
	async (importOriginal) => {
		const actual = await importOriginal();
		return { ...actual, getJobById: mockedGetJobById };
	},
);
vitest_1.vi.mock(
	"../src/services/applicationApiService",
	async (importOriginal) => {
		const actual = await importOriginal();
		return { ...actual, submitApplication: mockedSubmitApplication };
	},
);
vitest_1.vi.mock("../src/config/authMiddleware", () => ({
	requireAuth: (req, _res, next) => {
		req.session.jwtToken = "jwt-token";
		req.session.userRole = currentRole;
		next();
	},
}));
const app_1 = __importDefault(require("../src/app"));
function createJob(overrides = {}) {
	return {
		id: 1,
		roleName: "Software Engineer",
		location: "Remote",
		capability: { id: 1, name: "Engineering" },
		band: { id: 1, name: "Consultant" },
		closingDate: new Date("2026-08-28T22:00:00.000Z"),
		status: { id: 1, name: "OPEN" },
		description: "Build useful software.",
		responsibilities: "Build software;Review code",
		sharepointUrl: "https://example.com",
		numberOfOpenPositions: 2,
		...overrides,
	};
}
(0, vitest_1.describe)("job applications", () => {
	(0, vitest_1.beforeEach)(() => {
		currentRole = "USER";
		mockedGetJobById.mockReset();
		mockedSubmitApplication.mockReset();
		mockedGetJobById.mockResolvedValue(createJob());
		mockedSubmitApplication.mockResolvedValue({
			id: 1,
			jobRoleId: 1,
			status: "IN_PROGRESS",
			createdAt: "2026-08-18T00:00:00.000Z",
		});
	});
	(0, vitest_1.it)(
		"renders the apply link for an applicant and available open role",
		async () => {
			const response = await (0, supertest_1.default)(app_1.default).get(
				"/job-roles/1",
			);
			(0, vitest_1.expect)(response.status).toBe(200);
			(0, vitest_1.expect)(response.text).toContain(
				'href="/job-roles/1/applications/new"',
			);
		},
	);
	vitest_1.it.each([
		["non-applicant", "ADMIN", createJob()],
		["closed role", "USER", createJob({ status: { id: 2, name: "CLOSED" } })],
		["full role", "USER", createJob({ numberOfOpenPositions: 0 })],
		["negative positions", "USER", createJob({ numberOfOpenPositions: -1 })],
	])("does not render apply link for %s", async (_caseName, role, job) => {
		currentRole = role;
		mockedGetJobById.mockResolvedValueOnce(job);
		const response = await (0, supertest_1.default)(app_1.default).get(
			"/job-roles/1",
		);
		(0, vitest_1.expect)(response.status).toBe(200);
		(0, vitest_1.expect)(response.text).not.toContain("/applications/new");
	});
	(0, vitest_1.it)("renders the CV form for an applicant", async () => {
		const response = await (0, supertest_1.default)(app_1.default).get(
			"/job-roles/1/applications/new",
		);
		(0, vitest_1.expect)(response.status).toBe(200);
		(0, vitest_1.expect)(response.text).toContain('name="cv"');
		(0, vitest_1.expect)(response.text).toContain(
			'action="/job-roles/1/applications/new"',
		);
	});
	(0, vitest_1.it)("rejects an empty CV without submitting it", async () => {
		const response = await (0, supertest_1.default)(app_1.default)
			.post("/job-roles/1/applications/new")
			.type("form")
			.send({ cv: "   " });
		(0, vitest_1.expect)(response.status).toBe(400);
		(0, vitest_1.expect)(response.text).toContain("Enter your CV");
		(0, vitest_1.expect)(mockedSubmitApplication).not.toHaveBeenCalled();
	});
	(0, vitest_1.it)(
		"preserves backend conflict feedback and CV text",
		async () => {
			const error = new (
				await Promise.resolve().then(() =>
					__importStar(require("../src/services/applicationApiService")),
				)
			).ApplicationApiError(
				409,
				"Application already exists for this job role",
			);
			mockedSubmitApplication.mockRejectedValueOnce(error);
			const response = await (0, supertest_1.default)(app_1.default)
				.post("/job-roles/1/applications/new")
				.type("form")
				.send({ cv: "Jane Doe\nSoftware Engineer" });
			(0, vitest_1.expect)(response.status).toBe(409);
			(0, vitest_1.expect)(response.text).toContain(
				"Application already exists for this job role",
			);
			(0, vitest_1.expect)(response.text).toContain("Jane Doe");
		},
	);
	(0, vitest_1.it)(
		"redirects after a successful application without sending status",
		async () => {
			const response = await (0, supertest_1.default)(app_1.default)
				.post("/job-roles/1/applications/new")
				.type("form")
				.send({ cv: "Jane Doe\nSoftware Engineer" });
			(0, vitest_1.expect)(response.status).toBe(302);
			(0, vitest_1.expect)(response.headers.location).toBe(
				"/job-roles/1/applications/success",
			);
			(0, vitest_1.expect)(mockedSubmitApplication).toHaveBeenCalledWith(
				1,
				"Jane Doe\nSoftware Engineer",
				"jwt-token",
			);
		},
	);
	(0, vitest_1.it)(
		"returns forbidden for direct non-applicant access",
		async () => {
			currentRole = "ADMIN";
			const response = await (0, supertest_1.default)(app_1.default).get(
				"/job-roles/1/applications/new",
			);
			(0, vitest_1.expect)(response.status).toBe(403);
			(0, vitest_1.expect)(response.text).toContain("Access denied");
		},
	);
});
