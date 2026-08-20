import { defineConfig, devices } from "@playwright/test";
import { defineBddConfig } from "playwright-bdd";
import baseConfig from "./playwright.config";

const testDir = defineBddConfig({
	features: "e2e/features/**/*.feature",
	steps: ["e2e/steps/**/*.ts", "e2e/fixtures/testFixtures.ts"],
	outputDir: ".features-gen",
});

export default defineConfig({
	...baseConfig,
	testDir,
	projects: [
		{
			name: "bdd-chromium",
			use: { ...devices["Desktop Chrome"] },
		},
	],
});
