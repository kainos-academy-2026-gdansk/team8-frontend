import type { Locator, Page } from "@playwright/test";
import { BasePage } from "./basePage";

export class LoginPage extends BasePage {
	readonly heading: Locator;
	readonly emailInput: Locator;
	readonly passwordInput: Locator;
	readonly submitButton: Locator;

	constructor(page: Page) {
		super(page, "/login");
		this.heading = page.getByRole("heading", { name: "Sign in", level: 1 });
		this.emailInput = page.getByLabel("Email");
		this.passwordInput = page.getByLabel("Password", { exact: true });
		this.submitButton = page.getByRole("button", { name: "Sign in" });
	}

	async fillForm(email: string, password: string): Promise<void> {
		await this.emailInput.fill(email);
		await this.passwordInput.fill(password);
	}

	async submit(): Promise<void> {
		await this.submitButton.click();
	}

	async login(email: string, password: string): Promise<void> {
		await this.fillForm(email, password);
		await this.submit();
	}
}
