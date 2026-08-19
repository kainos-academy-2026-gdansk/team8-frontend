import { Router } from "express";
import { ApplicationController } from "../controllers/applicationController";
import { requireAdmin } from "../config/authMiddleware";

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

router.get(
	"/job-roles/:jobRoleId/applications/:applicationId/hire",
	requireAdmin,
	(req, res, next) => {
		controller.showHireConfirm(req, res).catch(next);
	},
);

router.post(
	"/job-roles/:jobRoleId/applications/:applicationId/hire",
	requireAdmin,
	(req, res, next) => {
		controller.hire(req, res).catch(next);
	},
);

router.get(
	"/job-roles/:jobRoleId/applications/:applicationId/reject",
	requireAdmin,
	(req, res, next) => {
		controller.showRejectConfirm(req, res).catch(next);
	},
);

router.post(
	"/job-roles/:jobRoleId/applications/:applicationId/reject",
	requireAdmin,
	(req, res, next) => {
		controller.reject(req, res).catch(next);
	},
);

export default router;
