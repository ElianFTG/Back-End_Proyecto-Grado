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
  requireRole("propietario", "administrador"),
  controller.create
);

RouteRouter.put(
  "/routes/:id",
  authJwt(authService),
  requireRole("propietario", "administrador"),
  controller.update
);

RouteRouter.get(
  "/routes/:id",
  authJwt(authService),
  requireRole("propietario", "administrador"),
  controller.findById
);

RouteRouter.get(
  "/routes",
  authJwt(authService),
  requireRole("propietario", "administrador"),
  controller.getRoutes
);



export { RouteRouter };
