import { Router } from "express";
import { CategoryController } from "./CategoryController";

const controller = new CategoryController();

const CategoryRouter = Router();

CategoryRouter.get("/categories", controller.getAll.bind(controller));
CategoryRouter.post("/categories", controller.create.bind(controller));
CategoryRouter.get("/categories/:id", controller.findById.bind(controller));
CategoryRouter.patch("/categories/:id", controller.update.bind(controller));
CategoryRouter.patch("/categories/:id/state", controller.updateState.bind(controller));

export { CategoryRouter };
