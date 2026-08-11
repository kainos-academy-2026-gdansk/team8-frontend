export interface Capability {
	id: number;
	name: string;
}

export interface Band {
	id: number;
	name: string;
}

export interface JobRole {
	id: number;
	roleName: string;
	location: string;
	capabilityId: number;
	bandId: number;
	closingDate: Date;
	status: string;
}

export interface JobRoleWithRelations extends JobRole {
	capability: Capability;
	band: Band;
}

export class JobRoleService {
	private capabilities: Capability[] = [
		{ id: 1, name: "Engineering" },
		{ id: 2, name: "Quality Assurance" },
		{ id: 3, name: "Data" },
		{ id: 4, name: "Delivery" },
	];

	private bands: Band[] = [
		{ id: 1, name: "Associate" },
		{ id: 2, name: "Consultant" },
		{ id: 3, name: "Senior Consultant" },
		{ id: 4, name: "Principal" },
	];

	private jobRoles: JobRole[] = [
		{
			id: 1,
			roleName: "Frontend Engineer",
			location: "Gdansk",
			capabilityId: 1,
			bandId: 2,
			closingDate: new Date("2026-09-30T23:59:59.000Z"),
			status: "OPEN",
		},
		{
			id: 2,
			roleName: "QA Automation Engineer",
			location: "Warsaw",
			capabilityId: 2,
			bandId: 3,
			closingDate: new Date("2026-10-15T23:59:59.000Z"),
			status: "OPEN",
		},
		{
			id: 3,
			roleName: "Data Analyst",
			location: "Krakow",
			capabilityId: 3,
			bandId: 1,
			closingDate: new Date("2026-08-31T23:59:59.000Z"),
			status: "CLOSED",
		},
		{
			id: 4,
			roleName: "Delivery Lead",
			location: "Remote",
			capabilityId: 4,
			bandId: 4,
			closingDate: new Date("2026-11-20T23:59:59.000Z"),
			status: "OPEN",
		},
	];

	async getAllRoles(): Promise<JobRoleWithRelations[]> {
		return this.jobRoles
			.map((role) => this.withRelations(role))
			.filter((role): role is JobRoleWithRelations => role !== undefined);
	}

	async getRoleById(id: number): Promise<JobRoleWithRelations | undefined> {
		const role = this.jobRoles.find((jobRole) => jobRole.id === id);
		if (!role) return undefined;

		return this.withRelations(role);
	}

	async getCapabilities(): Promise<Capability[]> {
		return this.capabilities;
	}

	async getBands(): Promise<Band[]> {
		return this.bands;
	}

	private withRelations(role: JobRole): JobRoleWithRelations | undefined {
		const capability = this.capabilities.find(
			(item) => item.id === role.capabilityId,
		);
		const band = this.bands.find((item) => item.id === role.bandId);

		if (!capability || !band) return undefined;

		return {
			...role,
			capability,
			band,
		};
	}
}
