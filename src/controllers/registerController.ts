import type { Request, Response } from "express";
import {
	type RegisterFormErrors,
	validateRegisterForm,
} from "../models/registerForm";
import { RegisterApiError, registerAccount } from "../services/authApiService";

type RegisterFieldName = "email" | "password" | "confirmPassword";

type RegisterErrorItem = {
	field: RegisterFieldName;
	message: string;
};

type RegisterValues = {
	email: string;
};

type RegisterViewModel = {
	values: RegisterValues;
	errors: RegisterFormErrors;
	errorList: RegisterErrorItem[];
	backendError?: string;
	successMessage?: string;
};

const EMPTY_VALUES: RegisterValues = {
	email: "",
};

const REGISTER_VIEW = "pages/register.njk";

function buildErrorList(errors: RegisterFormErrors): RegisterErrorItem[] {
	const fields: RegisterFieldName[] = ["email", "password", "confirmPassword"];

	return fields
		.map((field) => {
			const message = errors[field];
			if (!message) {
				return undefined;
			}

			return {
				field,
				message,
			};
		})
		.filter((item): item is RegisterErrorItem => item !== undefined);
}

function renderRegister(
	res: Response,
	status: number,
	model: RegisterViewModel,
): void {
	res.status(status).render(REGISTER_VIEW, model);
}

export class RegisterController {
	get(_req: Request, res: Response): void {
		renderRegister(res, 200, {
			values: { ...EMPTY_VALUES },
			errors: {},
			errorList: [],
		} satisfies RegisterViewModel);
	}

	async post(req: Request, res: Response): Promise<void> {
		const validation = validateRegisterForm(req.body);
		const values = {
			email:
				typeof req.body?.email === "string" ? req.body.email.trim() : "",
		};

		if (!validation.success) {
			const errorList = buildErrorList(validation.errors);
			renderRegister(res, 400, {
				values,
				errors: validation.errors,
				errorList,
			} satisfies RegisterViewModel);
			return;
		}

		try {
			await registerAccount({
				email: validation.data.email,
				password: validation.data.password,
				confirmPassword: validation.data.confirmPassword,
			});

			renderRegister(res, 201, {
				values: { ...EMPTY_VALUES },
				errors: {},
				errorList: [],
				successMessage: "Your account has been created. You can now sign in.",
			} satisfies RegisterViewModel);
		} catch (error) {
			const backendError =
				error instanceof RegisterApiError
					? error.message
					: "We could not complete registration right now. Please try again.";
			const responseStatus =
				error instanceof RegisterApiError
					? error.statusCode >= 400 && error.statusCode < 500
						? error.statusCode
						: 502
					: 502;

			renderRegister(res, responseStatus, {
				values,
				errors: {},
				errorList: [],
				backendError,
			} satisfies RegisterViewModel);
		}
	}
}
