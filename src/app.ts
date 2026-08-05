import express from "express";
import nunjucks from "nunjucks";

export const app = express();

app.use(express.json());

app.get("/health", (_req, res) => {
	res.json({ status: "OK", timestamp: new Date().toISOString() });
});

nunjucks.configure('./src/views/pages', {
    autoescape: true,
    express: app
});

app.get('/', function(req, res) {
    res.render('./index.njk', {message: 'Hello world!'});
});

export default app;
