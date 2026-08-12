import { Router } from "express";
import { RegisterController } from "../controllers/registerController";
import Logger from "../lib/logger";

const router = Router();
const registerController = new RegisterController();



router.get("/register", (req, res) => {
	Logger.info("Register page rendered");
	registerController.get(req, res);
});

router.post("/register", (req, res, next) => {
    registerController.post(req, res).catch(next);
});

export default router;