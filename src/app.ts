import express from "express";
import nunjucks from "nunjucks";
import morganMiddleware from "./config/morganMiddleware";
import Logger from "./lib/logger";

export const app = express();

app.use(express.json());
app.use(morganMiddleware);

app.get("/health", (_req, res) => {
	Logger.info("Health check called");
	res.json({ status: "OK", timestamp: new Date().toISOString() });
});

nunjucks.configure("src/views", {
	autoescape: true,
	express: app,
	noCache: true,
});

app.get("/", (_req, res) => {
	Logger.info("Index page rendered");
	res.render("pages/index.njk", { message: "Hello world!" });
});

export default app;
