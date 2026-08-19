import { Router } from "express";
import { JobRoleController } from "../controllers/jobRoleController";
import Logger from "../lib/logger";

const router = Router();
const controller = new JobRoleController();

router.get("/job-roles", (req, res) => {
	Logger.info("Job roles page rendered");
	controller.getAll(req, res);
});

router.get("/job-roles/new", (req, res, next) => {
	controller.showCreate(req, res).catch(next);
});

router.post("/job-roles/new", (req, res, next) => {
	controller.create(req, res).catch(next);
});

router.get("/job-roles/:id", async (req, res, next) => {
	try {
		Logger.info(`Job role details page rendered for ID: ${req.params.id}`);
		await controller.getById(req, res);
	} catch (error) {
		next(error);
	}
});

export default router;
