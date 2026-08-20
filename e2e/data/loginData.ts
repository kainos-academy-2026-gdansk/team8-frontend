import { VALID_EMAIL, VALID_PASSWORD } from "./registerData";

export type LoginCredentials = {
	email: string;
	password: string;
};

export const missingPasswordLogin: LoginCredentials = {
	email: VALID_EMAIL,
	password: "",
};

export const missingEmailLogin: LoginCredentials = {
	email: "",
	password: VALID_PASSWORD,
};

// Never registered, so the backend always reports it as invalid.
export const unknownEmailLogin: LoginCredentials = {
	email: "no.such.user.e2e@kainos.com",
	password: VALID_PASSWORD,
};

export function wrongPasswordLogin(email: string): LoginCredentials {
	return { email, password: "WrongPassword1!" };
}

export const loginErrors = {
	bothRequired: "Enter both email and password",
} as const;
