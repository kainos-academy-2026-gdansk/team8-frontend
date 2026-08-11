import { Router } from "express";
import { JobRoleController } from "../controllers/jobRoleController";
import Logger from "../lib/logger";

const router = Router();
const controller = new JobRoleController();

router.get("/health", (_req, res) => {
	Logger.info("Health check called");
	res.json({ status: "OK", timestamp: new Date().toISOString() });
});

router.get("/", (_req, res) => {
	Logger.info("Index page rendered");
	res.render("pages/index.njk", { message: "Hello world!" });
});

router.get("/job-roles", (req, res) => {
	Logger.info("Job roles page rendered");
	controller.getAll(req, res);
});

router.get("/job-roles/:id", (req, res) => {
	Logger.info(`Job role details page rendered for ID: ${req.params.id}`);
	controller.getById(req, res);
});

export default router;
