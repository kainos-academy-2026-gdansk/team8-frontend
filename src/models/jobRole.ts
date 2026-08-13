import { z } from "zod";

export const JOB_ROLES_PAGE_SIZE = 10;

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
