import type { Locator, Page, Response } from "@playwright/test";

export abstract class BasePage {
	protected constructor(
		protected readonly page: Page,
		private readonly path: string,
	) {}

	// Returns the navigation response so steps can assert on its status.
	async goto(): Promise<Response | null> {
		return this.page.goto(this.path);
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
