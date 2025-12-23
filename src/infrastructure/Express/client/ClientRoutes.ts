import { Router } from "express";
import { ClientServiceContainer } from "../../../shared/service_containers/client/ClientServiceContainer";
import { AuthServiceContainer } from "../../../shared/service_containers/auth/AuthServiceContainer";
import { authJwt } from "../middlewares/authJwt";
import { requireRole } from "../middlewares/requireRole";
import { ClientController } from "./ClientController";

const ClientRouter = Router();

const controller = new ClientController();
const authService = AuthServiceContainer.authService(); // asegúrate que exista como static

ClientRouter.post(
    "/clients",
    authJwt(authService),
    requireRole("super administrador"),
    controller.create
);

ClientRouter.get(
    "/clients",
    
    controller.getAll
);

ClientRouter.get(
    "/clients/:id",
    authJwt(authService),
    controller.findById
);

ClientRouter.patch(
    "/clients/:id",
    authJwt(authService),
    requireRole("administrador"),
    controller.update
);

ClientRouter.delete(
    "/clients/:id",
    authJwt(authService),
    requireRole("administrador"),
    controller.softDelete
);

export {ClientRouter};
