import { Router } from "express";
import { RouteController } from "./RouteController";
import { AuthServiceContainer } from "../../../shared/service_containers/auth/AuthServiceContainer";
import { authJwt } from "../middlewares/authJwt";
import { requireRole } from "../middlewares/requireRole";

const RouteRouter = Router();

const controller = new RouteController();
const authService = AuthServiceContainer.authService();

RouteRouter.post(
  "/routes",
  authJwt(authService),
  requireRole("administrador"),
  controller.create.bind(controller)
);


RouteRouter.get(
  "/routes/:id",
  authJwt(authService),
  requireRole("administrador"),
  controller.findById.bind(controller)
);


export { RouteRouter };
