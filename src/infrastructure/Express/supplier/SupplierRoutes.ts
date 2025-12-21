import { Router } from "express";
import { SupplierController } from "./SupplierController";

const controller = new SupplierController();

const SupplierRouter = Router();

SupplierRouter.get("/suppliers", controller.getAll.bind(controller));
SupplierRouter.post("/suppliers", controller.create.bind(controller));
SupplierRouter.get("/suppliers/:id", controller.findById.bind(controller));
SupplierRouter.patch("/suppliers/:id", controller.update.bind(controller));
SupplierRouter.patch("/suppliers/:id/state", controller.updateState.bind(controller));

export { SupplierRouter };
