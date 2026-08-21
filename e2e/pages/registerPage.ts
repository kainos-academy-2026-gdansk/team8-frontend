import type { Locator, Page } from "@playwright/test";
import type { RegisterCredentials } from "../data/registerData";
import { BasePage } from "./basePage";

export class RegisterPage extends BasePage {
	readonly heading: Locator;
	readonly emailInput: Locator;
	readonly passwordInput: Locator;
	readonly confirmPasswordInput: Locator;
	readonly submitButton: Locator;
	readonly loginLink: Locator;
	readonly successMessage: Locator;

	constructor(page: Page) {
		super(page, "/register");
		this.heading = page.getByRole("heading", {
			name: "Create your account",
			level: 1,
		});
		this.emailInput = page.getByLabel("Email");
		this.passwordInput = page.getByLabel("Password", { exact: true });
		this.confirmPasswordInput = page.getByLabel("Confirm password");
		this.submitButton = page.getByRole("button", { name: "Create account" });
		this.loginLink = page.getByRole("link", { name: "Login here" });
		this.successMessage = page.getByText(
			"Your account has been created. You can now sign in.",
		);
	}

	get emailError(): Locator {
		return this.fieldError("email");
	}

	get passwordError(): Locator {
		return this.fieldError("password");
	}

	get confirmPasswordError(): Locator {
		return this.fieldError("confirmPassword");
	}

	async fillForm(credentials: RegisterCredentials): Promise<void> {
		await this.emailInput.fill(credentials.email);
		await this.passwordInput.fill(credentials.password);
		await this.confirmPasswordInput.fill(credentials.confirmPassword);
	}

	async submit(): Promise<void> {
		await this.submitButton.click();
	}

	async register(credentials: RegisterCredentials): Promise<void> {
		await this.fillForm(credentials);
		await this.submit();
	}

	async goToLogin(): Promise<void> {
		await this.loginLink.click();
	}
}
