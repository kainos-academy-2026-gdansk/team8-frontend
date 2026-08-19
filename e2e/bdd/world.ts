import type { Page } from "@playwright/test";
import { RegisterPage } from "../pages/registerPage";

export class World {
	readonly registerPage: RegisterPage;

	constructor(page: Page) {
		this.registerPage = new RegisterPage(page);
	}
}
