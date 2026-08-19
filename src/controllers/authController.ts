import type { Request, Response } from "express";
import {
	LoginApiError,
	login as loginWithApi,
} from "../services/authApiService.js";
import Logger from "../lib/logger.js";

const LOGIN_VIEW = "pages/login.njk";

function getRoleFromJwt(jwtToken: string): string | undefined {
	try {
		const payloadSegment = jwtToken.split(".")[1];
		if (!payloadSegment) return undefined;

		const payload: unknown = JSON.parse(
			Buffer.from(payloadSegment, "base64url").toString("utf8"),
		);
		if (
			typeof payload === "object" &&
			payload !== null &&
			"role" in payload &&
			typeof payload.role === "string"
		) {
			return payload.role;
		}
	} catch {
		return undefined;
	}

	return undefined;
}

export class AuthController {
	showLogin(req: Request, res: Response): void {
		if (req.session.jwtToken) {
			res.redirect("/job-roles");
			return;
		}

		res.render(LOGIN_VIEW, {
			formValues: { email: "" },
		});
	}

	async login(req: Request, res: Response): Promise<void> {
		const email = String(req.body.email ?? "").trim();
		const password = String(req.body.password ?? "");

		if (!email || !password) {
			res.status(400).render(LOGIN_VIEW, {
				errorMessage: "Enter both email and password",
				formValues: { email },
			});
			return;
		}

		try {
			const jwtToken = await loginWithApi(email, password);
			req.session.jwtToken = jwtToken;
			req.session.userRole = getRoleFromJwt(jwtToken);
			res.redirect("/job-roles");
		} catch (error) {
			const message =
				error instanceof LoginApiError
					? error.message
					: "Unable to sign in right now. Please try again later.";
			const status =
				error instanceof LoginApiError && error.statusCode === 401 ? 401 : 502;
			res.status(status).render(LOGIN_VIEW, {
				errorMessage: message,
				formValues: { email },
			});
		}
	}

	logout(req: Request, res: Response): void {
		req.session.destroy((error) => {
			if (error) {
				Logger.error("Session destroy failed during logout", { error });
				res.status(500).render("pages/error.njk", {
					status: 500,
					title: "Logout failed",
					message: "Unable to sign out. Please try again.",
				});
				return;
			}
			res.clearCookie("connect.sid");
			res.redirect("/");
		});
	}
}
