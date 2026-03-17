import { Router } from "express";
import { ActivityController } from "./ActivityController";
import { AuthServiceContainer } from "../../../shared/service_containers/auth/AuthServiceContainer";
import { authJwt } from "../middlewares/authJwt";

const ActivityRouter = Router();
const controller = new ActivityController();
const authService = AuthServiceContainer.authService();

ActivityRouter.post("/activity-details", authJwt(authService), controller.createDetail.bind(controller));
ActivityRouter.get("/activity/preseller", authJwt(authService), controller.getForPreseller.bind(controller));
export { ActivityRouter };