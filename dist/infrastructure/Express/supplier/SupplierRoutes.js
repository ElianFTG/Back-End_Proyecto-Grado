"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SupplierRouter = void 0;
const express_1 = require("express");
const SupplierController_1 = require("./SupplierController");
const controller = new SupplierController_1.SupplierController();
const SupplierRouter = (0, express_1.Router)();
exports.SupplierRouter = SupplierRouter;
SupplierRouter.get("/suppliers", controller.getAll.bind(controller));
SupplierRouter.post("/suppliers", controller.create.bind(controller));
SupplierRouter.get("/suppliers/:id", controller.findById.bind(controller));
SupplierRouter.patch("/suppliers/:id", controller.update.bind(controller));
SupplierRouter.patch("/suppliers/:id/state", controller.updateState.bind(controller));
//# sourceMappingURL=SupplierRoutes.js.map