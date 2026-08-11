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
	capability: Capability;
	band: Band;
	closingDate: Date;
	status: Status;
}

export interface JobRoleDetailed extends JobRole {
	description: string;
	responsibilities: string;
	sharepointUrl: string;
	numberOfOpenPositions: number;
}
