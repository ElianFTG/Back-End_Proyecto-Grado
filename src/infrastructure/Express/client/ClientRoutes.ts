import { Router } from "express";
import multer from "multer";

import { AuthServiceContainer } from "../../../shared/service_containers/auth/AuthServiceContainer";
import { authJwt } from "../middlewares/authJwt";
import { requireRole } from "../middlewares/requireRole";
import { ClientController } from "./ClientController";


const ClientRouter = Router();

const controller = new ClientController();
const authService = AuthServiceContainer.authService(); // asegúrate que exista como static

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 }, // 8MB
});

ClientRouter.post(
    "/clients",
    authJwt(authService),
    requireRole("super administrador"),
    upload.single("image"),
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
    upload.single("image"),
    controller.update
);

ClientRouter.delete(
    "/clients/:id",
    authJwt(authService),
    requireRole("administrador"),
    controller.softDelete
);

export {ClientRouter};
