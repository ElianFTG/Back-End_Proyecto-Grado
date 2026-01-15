import { Router } from "express";
import multer from "multer";
import { BusinessController } from "./BusinessController";

import { AuthServiceContainer } from "../../../shared/service_containers/auth/AuthServiceContainer";
import { authJwt } from "../middlewares/authJwt";
import { requireRole } from "../middlewares/requireRole";

const BusinessRouter = Router();
const controller = new BusinessController();
const authService = AuthServiceContainer.authService();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 },
});

BusinessRouter.post(
  "/business",
  authJwt(authService),
  upload.single("image"),
  controller.create
);

BusinessRouter.get(
  "/business",
  authJwt(authService),
  controller.getAll
);

BusinessRouter.get(
  "/business/:id",
  authJwt(authService),
  controller.findById
);

BusinessRouter.patch(
  "/business/:id",
  authJwt(authService),
  requireRole("super administrador","administrador"),
  upload.single("image"),
  controller.update
);

BusinessRouter.delete(
  "/business/:id",
  authJwt(authService),
  requireRole("super administrador","administrador"),
  controller.softDelete
);

export { BusinessRouter };
