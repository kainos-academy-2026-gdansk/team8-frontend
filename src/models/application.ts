export const APPLICATION_STATUS_VALUES = [
	"IN_PROGRESS",
	"HIRED",
	"REJECTED",
] as const;

export type ApplicationStatus = (typeof APPLICATION_STATUS_VALUES)[number];

export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
	IN_PROGRESS: "In progress",
	HIRED: "Hired",
	REJECTED: "Rejected",
};

export interface ApplicationSummaryDto {
	id: number;
	jobRoleId: number;
	applicantEmail: string;
	cv: string;
	status: ApplicationStatus;
	createdAt: Date;
}
