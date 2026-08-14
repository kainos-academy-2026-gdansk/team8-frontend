import { Router } from "express";
import { AuthController } from "../controllers/authController";
import { RegisterController } from "../controllers/registerController";
import { requireAuth } from "../config/authMiddleware";
import Logger from "../lib/logger";

const router = Router();
const registerController = new RegisterController();
const authController = new AuthController();

router.get("/register", (req, res) => {
	Logger.info("Register page rendered");
	registerController.get(req, res);
});

router.post("/register", (req, res, next) => {
	registerController.post(req, res).catch(next);
});

router.get("/login", (req, res) => authController.showLogin(req, res));
router.post("/login", (req, res, next) => authController.login(req, res).catch(next));
router.get("/logout", requireAuth, (req, res) =>
	authController.logout(req, res),
);

export default router;
