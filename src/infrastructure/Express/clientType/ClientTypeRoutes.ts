import { Router } from "express";
import { ClientTypeController } from "./ClientTypeController";
import { AuthServiceContainer } from "../../../shared/service_containers/auth/AuthServiceContainer";
import { authJwt } from "../middlewares/authJwt";
import { requireRole } from "../middlewares/requireRole";

const ClientTypeRouter = Router();
const controller = new ClientTypeController();
const authService = AuthServiceContainer.authService();

ClientTypeRouter.post(
    "/client-types", 
    authJwt(authService), 
    controller.create
);

ClientTypeRouter.get(
    "/client-types", 
    authJwt(authService), 
    controller.getAll
);

export { ClientTypeRouter };
