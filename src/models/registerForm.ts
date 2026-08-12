import { z } from "zod";

export const registerFormSchema = z
	.object({
		email: z
            .email("Enter an email address in the correct format")
			.trim()
			.min(1, "Enter an email address"),
		password: z
			.string()
			.min(1, "Enter a password")
			.min(8, "Password must be at least 8 characters")
			.regex(/[A-Z]/, {
				message: "Password must contain at least one uppercase letter",
			})
			.regex(/[a-z]/, {
				message: "Password must contain at least one lowercase letter",
			})
			.regex(/[^A-Za-z0-9]/, {
				message: "Password must contain at least one special character",
			}),
		confirmPassword: z.string().min(1, "Confirm your password"),
	})
	.superRefine((values, ctx) => {
		if (values.password !== values.confirmPassword) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: "Passwords must match",
				path: ["confirmPassword"],
			});
		}
	});

export type RegisterFormInput = z.input<typeof registerFormSchema>;
export type RegisterFormData = z.infer<typeof registerFormSchema>;

export type RegisterFormErrors = Partial<
	Record<keyof RegisterFormInput, string>
>;

export type RegisterValidationResult =
	| {
			success: true;
			data: RegisterFormData;
	  }
	| {
			success: false;
			errors: RegisterFormErrors;
	  };

function firstErrorMessage(messages?: string[]): string | undefined {
	if (!messages || messages.length === 0) {
		return undefined;
	}

	return messages[0];
}

export function validateRegisterForm(input: unknown): RegisterValidationResult {
	const parsed = registerFormSchema.safeParse(input);

	if (parsed.success) {
		return {
			success: true,
			data: parsed.data,
		};
	}

	const flat = parsed.error.flatten();
	const errors: RegisterFormErrors = {};

	const emailError = firstErrorMessage(flat.fieldErrors.email);
	if (emailError) {
		errors.email = emailError;
	}

	const passwordError = firstErrorMessage(flat.fieldErrors.password);
	if (passwordError) {
		errors.password = passwordError;
	}

	const confirmPasswordError = firstErrorMessage(
		flat.fieldErrors.confirmPassword,
	);
	if (confirmPasswordError) {
		errors.confirmPassword = confirmPasswordError;
	}

	return {
		success: false,
		errors,
	};
}
