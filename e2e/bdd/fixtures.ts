import { test as base, createBdd } from "playwright-bdd";
import { World } from "./world";

type Fixtures = {
	world: World;
};

export const test = base.extend<Fixtures>({
	world: async ({ page }, use) => {
		await use(new World(page));
	},
});

export const { Given, Then, When } = createBdd(test);
