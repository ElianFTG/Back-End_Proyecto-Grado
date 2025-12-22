"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryRouter = void 0;
const express_1 = require("express");
const CategoryController_1 = require("./CategoryController");
const controller = new CategoryController_1.CategoryController();
const CategoryRouter = (0, express_1.Router)();
exports.CategoryRouter = CategoryRouter;
CategoryRouter.get("/categories", controller.getAll.bind(controller));
CategoryRouter.post("/categories", controller.create.bind(controller));
CategoryRouter.get("/categories/:id", controller.findById.bind(controller));
CategoryRouter.patch("/categories/:id", controller.update.bind(controller));
CategoryRouter.patch("/categories/:id/state", controller.updateState.bind(controller));
//# sourceMappingURL=CategoryRoutes.js.map