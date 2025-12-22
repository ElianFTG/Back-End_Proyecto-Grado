"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BranchRouter = void 0;
const express_1 = require("express");
const BranchController_1 = require("./BranchController");
const controller = new BranchController_1.BranchController();
const BranchRouter = (0, express_1.Router)();
exports.BranchRouter = BranchRouter;
BranchRouter.get('/branches', controller.getAll.bind(controller));
BranchRouter.post('/branches', controller.create.bind(controller));
BranchRouter.get('/branches/:id', controller.findById.bind(controller));
BranchRouter.put('/branches/:id', controller.update.bind(controller));
BranchRouter.patch('/branches/:id/state', controller.updateState.bind(controller));
//# sourceMappingURL=BranchRoutes.js.map