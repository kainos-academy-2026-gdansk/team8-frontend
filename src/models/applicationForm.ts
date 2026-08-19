import { z } from "zod";

export const applicationFormSchema = z.object({
	cv: z.string().refine((value) => value.trim().length > 0, {
		message: "Enter your CV",
	}),
});

export type ApplicationFormData = z.infer<typeof applicationFormSchema>;
export type ApplicationFormErrors = Partial<
	Record<keyof ApplicationFormData, string>
>;

export type ApplicationValidationResult =
	| { success: true; data: ApplicationFormData }
	| { success: false; errors: ApplicationFormErrors };

export function validateApplicationForm(
	input: unknown,
): ApplicationValidationResult {
	const parsed = applicationFormSchema.safeParse(input);
	if (parsed.success) return { success: true, data: parsed.data };

	const errors: ApplicationFormErrors = {};
	const cvError = parsed.error.flatten().fieldErrors.cv?.[0];
	if (cvError) errors.cv = cvError;
	return { success: false, errors };
}
