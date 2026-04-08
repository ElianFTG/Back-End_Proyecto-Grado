import { Router } from "express";
import { BrandController } from "./BrandController";

const controller = new BrandController();

const BrandRouter = Router();

BrandRouter.get("/brands", controller.getAll.bind(controller));
BrandRouter.post("/brands", controller.create.bind(controller));
BrandRouter.get("/brands/:id", controller.findById.bind(controller));
BrandRouter.patch("/brands/:id", controller.update.bind(controller));
BrandRouter.patch("/brands/:id/state", controller.updateState.bind(controller));

export { BrandRouter };
