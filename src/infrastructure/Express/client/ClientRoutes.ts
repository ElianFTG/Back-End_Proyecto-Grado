import { Router } from "express";
import multer from "multer";

import { AuthServiceContainer } from "../../../shared/service_containers/auth/AuthServiceContainer";
import { authJwt } from "../middlewares/authJwt";
import { requireRole } from "../middlewares/requireRole";
import { ClientController } from "./ClientController";


const ClientRouter = Router();

const controller = new ClientController();
const authService = AuthServiceContainer.authService();

ClientRouter.post(
    "/clients",
    authJwt(authService),
    requireRole("super administrador", "prevendedor", "administrador"),
    controller.create
);

ClientRouter.get(
    "/clients/search",
    authJwt(authService),
    requireRole("super administrador", "administrador", "prevendedor"),
    controller.search
);

ClientRouter.get(
    "/clients",
    authJwt(authService),
    requireRole("super administrador", "administrador", "prevendedor"),
    controller.getAll
);

ClientRouter.get(
    "/clients/:id",
    authJwt(authService),
    requireRole("super administrador", "administrador"),
    controller.findById
);

ClientRouter.patch(
    "/clients/:id",
    authJwt(authService),
    requireRole("super administrador", "administrador"),
    controller.update
);

ClientRouter.delete(
    "/clients/:id",
    authJwt(authService),
    requireRole("super administrador", "administrador"),
    controller.softDelete
);

export { ClientRouter };
