import type { Locator, Page } from "@playwright/test";

export abstract class BasePage {
	protected constructor(
		protected readonly page: Page,
		private readonly path: string,
	) {}

	async goto(): Promise<void> {
		await this.page.goto(this.path);
	}

	get errorSummary(): Locator {
		return this.page.locator(".govuk-error-summary");
	}

	summaryLink(message: string): Locator {
		return this.errorSummary.getByRole("link", { name: message });
	}

	fieldError(field: string): Locator {
		return this.page.locator(`#${field}-error`);
	}
}
