import { Router } from "express";
import { PriceTypeController } from "./PriceTypeController";
import { AuthServiceContainer } from "../../../shared/service_containers/auth/AuthServiceContainer";
import { authJwt } from "../middlewares/authJwt";

const PriceTypeRouter = Router();
const controller = new PriceTypeController();
const authService = AuthServiceContainer.authService();

PriceTypeRouter.post("/price-types", authJwt(authService), controller.create);

PriceTypeRouter.get("/price-types", authJwt(authService), controller.getAll);

export { PriceTypeRouter };
