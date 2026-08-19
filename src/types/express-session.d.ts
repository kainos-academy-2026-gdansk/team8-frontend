import "express-session";

declare module "express-session" {
	interface SessionData {
		jwtToken?: string;
		userRole?: "ADMIN" | "USER";
	}
}
