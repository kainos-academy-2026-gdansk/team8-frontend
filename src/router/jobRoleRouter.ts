import { Router } from "express";
import { JobRoleController } from "../controllers/jobRoleController";
import { RegisterController } from "../controllers/registerController";
import Logger from "../lib/logger";

const router = Router();
const controller = new JobRoleController();
const registerController = new RegisterController();

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

router.get("/register", (req, res) => {
	Logger.info("Register page rendered");
	registerController.get(req, res);
});

router.post("/register", (req, res, next) => {
    registerController.post(req, res).catch(next);
});

export default router;
