import type { Page } from "@playwright/test";
import { LoginPage } from "../pages/loginPage";
import { RegisterPage } from "../pages/registerPage";

export class World {
	readonly registerPage: RegisterPage;
	readonly loginPage: LoginPage;

	constructor(page: Page) {
		this.registerPage = new RegisterPage(page);
		this.loginPage = new LoginPage(page);
	}
}
