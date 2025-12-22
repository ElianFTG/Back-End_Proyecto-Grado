"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRouter = void 0;
const express_1 = require("express");
const UserController_1 = require("./UserController");
const AuthServiceContainer_1 = require("../../../shared/service_containers/auth/AuthServiceContainer");
const controller = new UserController_1.UserController();
const authService = AuthServiceContainer_1.AuthServiceContainer.authService();
const UserRouter = (0, express_1.Router)();
exports.UserRouter = UserRouter;
UserRouter.get("/users", controller.getUsers);
UserRouter.get("/users/ci/:ci", controller.findByCi);
UserRouter.get("/users/:id", controller.findById);
UserRouter.post("/users", controller.create);
UserRouter.patch("/users/:id", controller.update);
UserRouter.patch("/users/:id/state", controller.updateState);
UserRouter.post('/users/:id/reset-password', controller.resetPassword);
UserRouter.patch('/users/:id/password', controller.updatePassword);
//# sourceMappingURL=UserRoutes.js.map