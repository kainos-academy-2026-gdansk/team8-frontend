import type express from "express";
import Logger from "../lib/logger";

export const notFoundMiddleware = (
	_req: express.Request,
	res: express.Response,
	_next: express.NextFunction,
) => {
	Logger.warn(`404 Not Found: ${_req.originalUrl}`);
	res.status(404).render("pages/not-found.njk", {
		status: 404,
		title: "Page not found",
		message: `We could not find ${_req.originalUrl}. Check the URL or continue from the homepage.`,
	});
};
