import { Router } from "express";
import { AreaController } from "./AreaController";
import { AuthServiceContainer } from "../../../shared/service_containers/auth/AuthServiceContainer";
import { authJwt } from "../middlewares/authJwt";
import { requireRole } from "../middlewares/requireRole";

const AreaRouter = Router();
const controller = new AreaController();
const authService = AuthServiceContainer.authService();

AreaRouter.post(
  "/areas",
  authJwt(authService),
  requireRole("administrador", "super administrador"),
  controller.create
);

AreaRouter.get(
  "/areas",
  authJwt(authService),
  requireRole("administrador", "super administrador"),
  controller.getAll
);

AreaRouter.get(
  "/areas/:id",
  authJwt(authService),
  requireRole("administrador", "super administrador"),
  controller.findById
);

AreaRouter.patch(
  "/areas/:id",
  authJwt(authService),
  requireRole("administrador", "super administrador"),
  controller.update
);

AreaRouter.delete(
  "/areas/:id",
  authJwt(authService),
  requireRole("administrador", "super administrador"),
  controller.softDelete
);

export { AreaRouter };
