import express from "express";
import nunjucks from "nunjucks";
import morganMiddleware from "./config/morganMiddleware";
import path from "node:path";
import router from "./router/jobRoleRouter";
import Logger from "./lib/logger";

export const app = express();

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
	"/govuk-frontend.min",
	express.static(
		path.join(
			__dirname,
			"..",
			"node_modules",
			"govuk-frontend",
			"dist",
			"govuk",
			"govuk-frontend.min",
		),
	),
);

app.use(express.json());
app.use(morganMiddleware);

app.use(express.urlencoded({ extended: true }));

app.use(router);

app.use((req, res) => {
	res.status(404).render("pages/not-found.njk", {
		status: 404,
		title: "Page not found",
		message: `We could not find ${req.originalUrl}. Check the URL or continue from the homepage.`,
	});
});

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
	Logger.error(`Unhandled error: ${err.message}`);
	res.status(500).render("pages/error.njk", {
		status: 500,
		title: "Something went wrong",
		message: "An unexpected error happened while processing your request.",
	});
});

export default app;
