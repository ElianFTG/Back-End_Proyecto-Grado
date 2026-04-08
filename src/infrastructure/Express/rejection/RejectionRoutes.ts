import { Router } from "express";
import { RejectionController } from "./RejectionController";
import { authJwt } from "../middlewares/authJwt";
import { requireRole } from "../middlewares/requireRole";
import { AuthServiceContainer } from "../../../shared/service_containers/auth/AuthServiceContainer"

const controller = new RejectionController();
const authService = AuthServiceContainer.authService();

export const RejectionRouter = Router();

RejectionRouter.post(
  "/rejections",
  authJwt(authService),
  requireRole("administrador"),
  controller.create.bind(controller)
);

RejectionRouter.get(
  "/rejections",
  authJwt(authService),
  controller.getAll.bind(controller)
);
