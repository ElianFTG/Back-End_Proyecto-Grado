"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthRouter = void 0;
const express_1 = require("express");
const AuthServiceContainer_1 = require("../../../shared/service_containers/auth/AuthServiceContainer");
exports.AuthRouter = (0, express_1.Router)();
const controller = AuthServiceContainer_1.AuthServiceContainer.authController();
exports.AuthRouter.post("/login", (req, res) => controller.loginHandler(req, res));
//# sourceMappingURL=AuthRoutes.js.map