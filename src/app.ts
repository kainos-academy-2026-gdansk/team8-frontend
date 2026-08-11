import express from "express";
import nunjucks from "nunjucks";
import morganMiddleware from "./config/morganMiddleware.js";
import path, { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import router from "./router/jobRoleRouter.js";

export const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = process.cwd();

nunjucks.configure(
	[
		path.join(projectRoot, "src", "views"),
		path.join(projectRoot, "node_modules", "govuk-frontend", "dist"),
	],
	{
		autoescape: true,
		express: app,
		noCache: true,
	},
);

app.use("/assets", express.static(path.join(projectRoot, "src", "assets")));

app.use(
	"/assets",
	express.static(
		path.join(
			__dirname,
			"..",
			"node_modules",
			"govuk-frontend",
			"dist",
			"govuk",
			"assets",
		),
	),
);

app.use(
	"/styles.css",
	express.static(path.join(projectRoot, "src", "styles.css")),
);

app.use("/styles", express.static(path.join(projectRoot, "src", "styles")));

app.use(
	"/govuk-frontend.min.css",
	express.static(
		path.join(
			__dirname,
			"..",
			"node_modules",
			"govuk-frontend",
			"dist",
			"govuk",
			"govuk-frontend.min.css",
		),
	),
);

app.use(
	"/govuk-frontend.min.js",
	express.static(
		path.join(
			__dirname,
			"..",
			"node_modules",
			"govuk-frontend",
			"dist",
			"govuk",
			"govuk-frontend.min.js",
		),
	),
);

app.use(express.json());
app.use(morganMiddleware);

app.use(express.urlencoded({ extended: true }));

app.use(router);

export default app;
