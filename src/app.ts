import express from "express";
import nunjucks from "nunjucks";

export const app = express();

app.use(express.json());

app.get("/health", (_req, res) => {
	res.json({ status: "OK", timestamp: new Date().toISOString() });
});

nunjucks.configure('src/views', {
    autoescape: true,
    express: app,
    noCache: true,
});

app.get('/', (_req, res) => {
    res.render('pages/index.njk', {message: 'Hello world!'});
});

export default app;
