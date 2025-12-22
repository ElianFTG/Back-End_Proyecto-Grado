"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const express_fileupload_1 = __importDefault(require("express-fileupload"));
const Mysql_1 = __importDefault(require("./infrastructure/db/Mysql"));
const UserRoutes_1 = require("./infrastructure/Express/user/UserRoutes");
const AuthRoutes_1 = require("./infrastructure/Express/auth/AuthRoutes");
const CountryRoutes_1 = require("./infrastructure/Express/country/CountryRoutes");
const BranchRoutes_1 = require("./infrastructure/Express/branch/BranchRoutes");
const SupplierRoutes_1 = require("./infrastructure/Express/supplier/SupplierRoutes");
const CategoryRoutes_1 = require("./infrastructure/Express/category/CategoryRoutes");
const CountrySeeder_1 = require("./infrastructure/db/seeders/CountrySeeder");
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use((0, cors_1.default)());
app.use(express_1.default.json());
Mysql_1.default.initialize()
    .then(async () => {
    await (0, CountrySeeder_1.seedCountries)();
})
    .catch((err) => {
    console.error('Failed to initialize database:', err);
    process.exit(1);
});
app.use((0, express_fileupload_1.default)({
    useTempFiles: true,
    tempFileDir: '/tmp/'
}));
app.use(UserRoutes_1.UserRouter);
app.use(AuthRoutes_1.AuthRouter);
app.use(CountryRoutes_1.CountryRouter);
app.use(SupplierRoutes_1.SupplierRouter);
app.use(CategoryRoutes_1.CategoryRouter);
app.use(BranchRoutes_1.BranchRouter);
app.use((req, res, next) => {
    res.status(404).json({ message: "endpoint not found" });
});
exports.default = app;
//# sourceMappingURL=app.js.map