import express from "express";
import nunjucks from "nunjucks";
import morganMiddleware from "./config/morganMiddleware";
import { errorMiddleware } from "./config/errorMiddleware";
import { notFoundMiddleware } from "./config/notFoundMiddleware";
import path from "node:path";
import jobRoleRouter from "./router/jobRoleRouter";
import authRouter from "./router/authRouter";

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

app.use(authRouter);
app.use(jobRoleRouter);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;
