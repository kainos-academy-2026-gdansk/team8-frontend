export type RegisterCredentials = {
	email: string;
	password: string;
	confirmPassword: string;
};

export const VALID_EMAIL = "test.user@kainos.com";
export const VALID_PASSWORD = "Password1!";

export const validRegistration: RegisterCredentials = {
	email: VALID_EMAIL,
	password: VALID_PASSWORD,
	confirmPassword: VALID_PASSWORD,
};

export const invalidEmailRegistration: RegisterCredentials = {
	...validRegistration,
	email: "not-an-email",
};

export const weakPasswordRegistration: RegisterCredentials = {
	email: VALID_EMAIL,
	password: "short",
	confirmPassword: "short",
};

export const mismatchedPasswordRegistration: RegisterCredentials = {
	email: VALID_EMAIL,
	password: VALID_PASSWORD,
	confirmPassword: "Password2!",
};

export const emptyRegistration: RegisterCredentials = {
	email: "",
	password: "",
	confirmPassword: "",
};

// Keeps parallel workers from colliding when a test creates a real account.
export function uniqueEmail(prefix = "e2e"): string {
	return `${prefix}.${Date.now()}.${Math.random().toString(36).slice(2, 8)}@kainos.com`;
}

export const registerErrors = {
	emailFormat: "Enter an email address in the correct format",
	passwordRequired: "Enter a password",
	confirmPasswordRequired: "Confirm your password",
	passwordTooShort: "Password must be at least 8 characters",
	passwordsMustMatch: "Passwords must match",
} as const;
