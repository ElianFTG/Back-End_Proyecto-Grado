import { Router } from "express";
import { BusinessTypeController } from "./BusinessTypeController";
import { AuthServiceContainer } from "../../../shared/service_containers/auth/AuthServiceContainer";
import { authJwt } from "../middlewares/authJwt";
import { requireRole } from "../middlewares/requireRole";

const BusinessTypeRouter = Router();
const controller = new BusinessTypeController();
const authService = AuthServiceContainer.authService();

BusinessTypeRouter.post("/business-types", authJwt(authService), controller.create);
BusinessTypeRouter.get("/business-types", authJwt(authService), controller.getAll);

export { BusinessTypeRouter };
