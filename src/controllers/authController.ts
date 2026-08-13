import type { Request, Response } from "express";
import {
	LoginApiError,
	login as loginWithApi,
} from "../services/authApiService.js";

const LOGIN_VIEW = "pages/login.njk";

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
		req.session.destroy(() => {
			res.clearCookie("connect.sid");
			res.redirect("/login");
		});
	}
}
