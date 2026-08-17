import express from "express";
import nunjucks from "nunjucks";
import morganMiddleware from "./config/morganMiddleware";
import { errorMiddleware } from "./config/errorMiddleware";
import { notFoundMiddleware } from "./config/notFoundMiddleware";
import path from "node:path";
import jobRoleRouter from "./router/jobRoleRouter";
import authRouter from "./router/authRouter";
import session from "express-session";
import { requireAuth } from "./config/authMiddleware";
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

// Persist login state across requests so protected routes can read req.session.jwtToken.
app.use(
	session({
		secret: process.env.SESSION_SECRET ?? "dev-session-secret",
		resave: false,
		saveUninitialized: false,
		cookie: {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			maxAge: 1000 * 60 * 60,
		},
	}),
);

// Expose auth state to all templates for sign in/sign out navigation.
app.use((req, res, next) => {
	res.locals.isAuthenticated = Boolean(req.session.jwtToken);
	next();
});

app.get("/health", (_req, res) => {
	Logger.info("Health check called");
	res.json({ status: "OK", timestamp: new Date().toISOString() });
});

app.get("/", (_req, res) => {
	Logger.info("Index page rendered");
	res.render("pages/index.njk", { message: "Hello world!" });
});

app.use(authRouter);
app.use(requireAuth);
app.use(jobRoleRouter);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;
