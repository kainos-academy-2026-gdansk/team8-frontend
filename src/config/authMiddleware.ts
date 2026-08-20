import type { NextFunction, Request, Response } from "express";

export function requireAuth(
	req: Request,
	res: Response,
	next: NextFunction,
): void {
	if (!req.session.jwtToken) {
		res.redirect("/login");
		return;
	}
	res.locals.userRole = req.session.userRole;
	res.locals.isAdmin = req.session.userRole === "ADMIN";
	next();
}

export function requireAdmin(
	req: Request,
	res: Response,
	next: NextFunction,
): void {
	if (req.session.userRole !== "ADMIN") {
		res.redirect("/job-roles");
		return;
	}
	next();
}
