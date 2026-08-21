import { VALID_EMAIL, VALID_PASSWORD, uniqueEmail } from "./registerData";

export type LoginCredentials = {
	email: string;
	password: string;
};

export const missingEmailLogin: LoginCredentials = {
	email: "",
	password: VALID_PASSWORD,
};

export const missingPasswordLogin: LoginCredentials = {
	email: VALID_EMAIL,
	password: "",
};

export const emptyLogin: LoginCredentials = {
	email: "",
	password: "",
};

export const loginErrors = {
	bothRequired: "Enter both email and password",
} as const;

export function createLoginCredentials(): LoginCredentials {
	return {
		email: uniqueEmail("login"),
		password: VALID_PASSWORD,
		// confirmPassword: VALID_PASSWORD,
	};
}
