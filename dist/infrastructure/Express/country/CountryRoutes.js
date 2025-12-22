"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CountryRouter = void 0;
const express_1 = require("express");
const CountryController_1 = require("./CountryController");
const controller = new CountryController_1.CountryController();
const CountryRouter = (0, express_1.Router)();
exports.CountryRouter = CountryRouter;
CountryRouter.get("/countries", controller.getAll.bind(controller));
//# sourceMappingURL=CountryRoutes.js.map