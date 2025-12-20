import { Router } from "express";
import { AuthServiceContainer } from "../../../shared/service_containers/auth/AuthServiceContainer";

export const AuthRouter = Router();

const controller = AuthServiceContainer.authController();

AuthRouter.post("/login", (req, res) => controller.loginHandler(req, res));
