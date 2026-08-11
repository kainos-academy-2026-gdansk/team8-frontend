import { Router } from "express";
import { JobRoleController } from "../controllers/jobRoleController";

const router = Router();
const controller = new JobRoleController();

router.get("/", (_req, res) => {
	res.render("pages/index.njk");
});

router.get("/job-roles", (req, res) => controller.getAll(req, res));

export default router;
