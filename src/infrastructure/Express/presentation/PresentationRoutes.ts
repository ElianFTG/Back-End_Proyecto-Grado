import { Router } from "express";
import { PresentationController } from "./PresentationController";

const controller = new PresentationController();

const PresentationRouter = Router();

PresentationRouter.get("/presentations", controller.getAll.bind(controller));
PresentationRouter.post("/presentations", controller.create.bind(controller));
PresentationRouter.get("/presentations/:id", controller.findById.bind(controller));
PresentationRouter.patch("/presentations/:id", controller.update.bind(controller));
PresentationRouter.patch("/presentations/:id/state", controller.updateState.bind(controller));

export { PresentationRouter };
