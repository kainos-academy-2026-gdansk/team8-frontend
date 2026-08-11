export type Status = "OPEN" | "CLOSED";

export interface JobRole {
	id: number;
	roleName: string;
	location: string;
	capabilityId: number;
	bandId: number;
	closingDate: Date;
	status: Status;
}

export interface JobRoleDetailed extends JobRole {
	description: string;
	responsibilities: string[];
	sharepointUrl: string;
	numberOfOpenPositions: number;
}
