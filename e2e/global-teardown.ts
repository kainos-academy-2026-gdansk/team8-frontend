import type { FullConfig } from "@playwright/test";

async function globalTeardown(_config: FullConfig): Promise<void> {
	// Add environment cleanup here when tests start creating persistent data.
}

export default globalTeardown;
