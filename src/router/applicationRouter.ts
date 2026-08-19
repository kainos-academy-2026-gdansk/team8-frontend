import { Router } from "express";
import { ApplicationController } from "../controllers/applicationController";

const router = Router();
const controller = new ApplicationController();

router.get("/job-roles/:id/applications/new", (req, res, next) => {
	controller.get(req, res).catch(next);
});

router.post("/job-roles/:id/applications/new", (req, res, next) => {
	controller.post(req, res).catch(next);
});

router.get("/job-roles/:id/applications/success", (req, res) => {
	controller.success(req, res);
});

export default router;
