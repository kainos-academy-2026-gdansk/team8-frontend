import type { Locator, Page } from "@playwright/test";
import { BasePage } from "./basePage";

export class JobRoleListPage extends BasePage {
	readonly heading: Locator;
	readonly pagination: Locator;
	readonly previousPage: Locator;
	readonly currentPage: Locator;
	readonly nextPage: Locator;
	readonly resultsSummary: Locator;
	readonly jobRoleListings: Locator;

	constructor(page: Page) {
		super(page, "/job-roles");

		this.heading = page.getByRole("heading", {
			name: "All job roles",
			level: 1,
		});

		this.pagination = page.getByRole("navigation", {
			name: "Pagination",
		});

		this.previousPage = this.pagination.locator(
			".govuk-pagination__prev [aria-disabled='true']",
		);

		this.currentPage = this.pagination.getByRole("link", {
			name: "Page 1",
		});

		this.nextPage = this.pagination.getByRole("link", {
			name: "Next page",
		});

		this.resultsSummary = page.locator(".job-role-results-summary");
		this.jobRoleListings = page.getByRole("list", {
			name: "Job role listings",
		});
	}

	async scrollToBottom(): Promise<void> {
		await this.pagination.scrollIntoViewIfNeeded();
	}
}
