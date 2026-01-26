import { Router } from "express";
import { ActivityController } from "./ActivityController";

import { AuthServiceContainer } from "../../../shared/service_containers/auth/AuthServiceContainer";
import { authJwt } from "../middlewares/authJwt";
import { requireRole } from "../middlewares/requireRole";

const ActivityRouter = Router();
const controller = new ActivityController();
const authService = AuthServiceContainer.authService();

ActivityRouter.post(
  "/activities",
  authJwt(authService),
  controller.create.bind(controller)
);

export { ActivityRouter };
