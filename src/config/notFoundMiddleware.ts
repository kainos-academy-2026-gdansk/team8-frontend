import type express from "express";
import Logger from "../lib/logger";

export const notFoundMiddleware = (req: express.Request, res: express.Response) => {
    Logger.warn(`404 Not Found: ${req.originalUrl}`);
    res.status(404).render("pages/not-found.njk", {
        status: 404,
        title: "Page not found",
        message: `We could not find ${req.originalUrl}. Check the URL or continue from the homepage.`,
    });
};