import { z } from "zod";

export const JOB_ROLES_PAGE_SIZE = 10;

export const JOB_ROLE_CAPABILITY_OPTIONS = [
	"Software Engineering",
	"Cloud",
	"DevOps",
	"Platform Engineering",
	"Quality Engineering",
	"Data & Analytics",
	"Artificial Intelligence & Machine Learning",
	"Experience Design",
	"Product Management",
	"Business Analysis",
	"Cyber Security",
	"Workday",
	"Solution Architecture",
] as const;

export const JOB_ROLE_BAND_OPTIONS = [
	"Trainee",
	"Associate",
	"Senior Associate",
	"Consultant",
	"Senior Consultant",
	"Principal",
	"Manager",
	"Senior Manager",
	"Capability Lead",
	"Director",
] as const;

export const JOB_ROLE_STATUS_OPTIONS = [
	{ value: "OPEN", label: "Open" },
	{ value: "CLOSED", label: "Closed" },
] as const;

const requestedLimitSchema = z.coerce
	.number()
	.int()
	.positive()
	.catch(JOB_ROLES_PAGE_SIZE);
const offsetSchema = z.coerce.number().int().nonnegative().catch(0);

export const jobRolePaginationQuerySchema = z
	.object({
		limit: requestedLimitSchema,
		offset: offsetSchema,
	})
	.transform(({ offset }) => ({
		limit: JOB_ROLES_PAGE_SIZE,
		offset,
	}));

const optionalStringSchema = z.preprocess((value) => {
	if (typeof value !== "string") return undefined;
	return value.trim() || undefined;
}, z.string().optional());

function stringListSchema(options: readonly string[]) {
	return z.preprocess((value) => {
		const values = Array.isArray(value) ? value : [value];
		return values
			.filter((item): item is string => typeof item === "string")
			.map((item) => item.trim())
			.filter((item) => item.length > 0 && options.includes(item));
	}, z.array(z.string()).default([]));
}

const optionalDateSchema = z.preprocess((value) => {
	if (typeof value !== "string") return undefined;
	const normalizedValue = value.trim();
	if (!/^\d{4}-\d{2}-\d{2}$/.test(normalizedValue)) return undefined;
	const parsedDate = new Date(`${normalizedValue}T00:00:00.000Z`);
	return !Number.isNaN(parsedDate.getTime()) &&
		parsedDate.toISOString().startsWith(normalizedValue)
		? normalizedValue
		: undefined;
}, z.string().optional());

export const jobRoleFiltersSchema = z.object({
	roleName: optionalStringSchema,
	location: optionalStringSchema,
	capability: stringListSchema(JOB_ROLE_CAPABILITY_OPTIONS),
	band: stringListSchema(JOB_ROLE_BAND_OPTIONS),
	status: stringListSchema(JOB_ROLE_STATUS_OPTIONS.map(({ value }) => value)),
	closingDateAfter: optionalDateSchema,
	closingDateBefore: optionalDateSchema,
});

export type JobRoleFilters = z.infer<typeof jobRoleFiltersSchema>;

export function hasJobRoleFilters(filters: JobRoleFilters): boolean {
	return Object.values(filters).some((value) =>
		Array.isArray(value) ? value.length > 0 : value !== undefined,
	);
}

export const jobRoleListQuerySchema = z
	.object({
		limit: requestedLimitSchema,
		offset: offsetSchema,
		roleName: z.unknown().optional(),
		location: z.unknown().optional(),
		capability: z.unknown().optional(),
		band: z.unknown().optional(),
		status: z.unknown().optional(),
		closingDateAfter: z.unknown().optional(),
		closingDateBefore: z.unknown().optional(),
	})
	.transform(({ offset, ...query }) => {
		const filters = jobRoleFiltersSchema.parse(query);
		return {
			limit: JOB_ROLES_PAGE_SIZE,
			offset,
			filters,
			isFiltered: hasJobRoleFilters(filters),
		};
	});

export type JobRolePaginationQuery = z.infer<
	typeof jobRolePaginationQuerySchema
>;

export type StatusName = "OPEN" | "CLOSED";

export interface Capability {
	id: number;
	name: string;
}

export interface Band {
	id: number;
	name: string;
}

export interface Status {
	id: number;
	name: StatusName;
}

export interface JobRole {
	id: number;
	roleName: string;
	location: string;
	capabilityId?: number;
	capability: Capability;
	bandId?: number;
	band: Band;
	closingDate: Date;
	status: Status;
}

export interface JobRolePaginationLinks {
	first: string | null;
	previous: string | null;
	next: string | null;
	last: string | null;
}

export interface PaginatedJobRolesResponse {
	data: JobRole[];
	total: number;
	limit: number;
	offset: number;
	links: JobRolePaginationLinks;
}

export interface JobRolePage {
	jobRoles: JobRole[];
	total: number;
	limit: number;
	offset: number;
}

export interface JobRoleDetailed extends JobRole {
	description: string;
	responsibilities: string;
	sharepointUrl: string;
	numberOfOpenPositions: number;
}

export const createJobRoleSchema = z.object({
	roleName: z.string().trim().min(1, "Enter a role name"),
	description: z.string().trim().min(1, "Enter a description"),
	responsibilities: z.string().trim().min(1, "Enter responsibilities"),
	sharepointUrl: z.string().trim().url("Enter a valid SharePoint URL"),
	location: z.string().trim().min(1, "Enter a location"),
	closingDate: z.string().min(1, "Enter a closing date"),
	numberOfOpenPositions: z.coerce
		.number()
		.int()
		.nonnegative("Enter zero or more open positions"),
	capabilityId: z.coerce.number().int().positive("Select a capability"),
	bandId: z.coerce.number().int().positive("Select a band"),
});

export type CreateJobRoleInput = z.input<typeof createJobRoleSchema>;
export type CreateJobRoleData = z.infer<typeof createJobRoleSchema>;
export type CreateJobRoleErrors = Partial<
	Record<keyof CreateJobRoleInput, string>
>;

export interface CatalogueItem {
	id: number;
	name: string;
}
