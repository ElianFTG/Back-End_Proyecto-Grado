import { Router } from "express";
import { ColorController } from "./ColorController";

const controller = new ColorController();

const ColorRouter = Router();

ColorRouter.get("/colors", controller.getAll.bind(controller));
ColorRouter.post("/colors", controller.create.bind(controller));
ColorRouter.get("/colors/:id", controller.findById.bind(controller));
ColorRouter.patch("/colors/:id", controller.update.bind(controller));
ColorRouter.patch("/colors/:id/state", controller.updateState.bind(controller));

export { ColorRouter };
