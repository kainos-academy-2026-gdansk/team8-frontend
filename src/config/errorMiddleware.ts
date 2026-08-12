import express from "express";
import Logger from "../lib/logger";

export const notFoundMiddleware = (_req: express.Request, res: express.Response) => {
	res.status(404).render("pages/not-found.njk", {
		status: 404,
		title: "Page not found",
		message: `We could not find ${_req.originalUrl}. Check the URL or continue from the homepage.`,
	});
};

export const errorMiddleware = (
	err: Error,
	_req: express.Request,
	res: express.Response,
	_next: express.NextFunction,
) => {
	Logger.error(`Unhandled error: ${err.message}`);
	res.status(500).render("pages/error.njk", {
		status: 500,
		title: "Something went wrong",
		message: "An unexpected error happened while processing your request.",
	});
};
