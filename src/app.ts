import express from "express";
import nunjucks from "nunjucks";
import morganMiddleware from "./config/morganMiddleware";
import Logger from "./lib/logger";
import path, { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import router from "./router/jobRoleRouter";

export const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = process.cwd();

nunjucks.configure(
	[
		path.join(__dirname, "views"),
		path.join(__dirname, "..", "node_modules", "govuk-frontend", "dist"),
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

app.get("/health", (_req, res) => {
	Logger.info("Health check called");
	res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// nunjucks.configure("src/views", {
// 	autoescape: true,
// 	express: app,
// 	noCache: true,
// });

app.get("/", (_req, res) => {
	Logger.info("Index page rendered");
	res.render("pages/index.njk", { message: "Hello world!" });
});

app.use(express.urlencoded({ extended: true }));

app.use(router);

export default app;
