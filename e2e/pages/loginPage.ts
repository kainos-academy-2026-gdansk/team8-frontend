import type { Locator, Page } from "@playwright/test";
import type { LoginCredentials } from "../data/loginData";
import { BasePage } from "./basePage";

export class LoginPage extends BasePage {
	readonly heading: Locator;
	readonly emailInput: Locator;
	readonly passwordInput: Locator;
	readonly submitButton: Locator;
	readonly registerLink: Locator;

	constructor(page: Page) {
		super(page, "/login");
		this.heading = page.getByRole("heading", { name: "Sign in", level: 1 });
		this.emailInput = page.getByLabel("Email");
		this.passwordInput = page.getByLabel("Password");
		this.submitButton = page.getByRole("button", { name: "Sign in" });
		this.registerLink = page.getByRole("link", { name: "Create one" });
	}

	async fillForm(credentials: LoginCredentials): Promise<void> {
		await this.emailInput.fill(credentials.email);
		await this.passwordInput.fill(credentials.password);
	}

	async submit(): Promise<void> {
		await this.submitButton.click();
	}

	async login(credentials: LoginCredentials): Promise<void> {
		await this.fillForm(credentials);
		await this.submit();
	}
}
