"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SupplierServiceContainer = void 0;
const CreateSupplier_1 = require("../../../application/supplier/CreateSupplier");
const GetAllSuppliers_1 = require("../../../application/supplier/GetAllSuppliers");
const FindByIdSupplier_1 = require("../../../application/supplier/FindByIdSupplier");
const UpdateSupplier_1 = require("../../../application/supplier/UpdateSupplier");
const UpdateStateSupplier_1 = require("../../../application/supplier/UpdateStateSupplier");
const MysqlSupplierRepository_1 = require("../../../infrastructure/repositories/MysqlSupplierRepository");
const SupplierRepository = new MysqlSupplierRepository_1.MysqlSupplierRepository();
exports.SupplierServiceContainer = {
    supplier: {
        getAll: new GetAllSuppliers_1.GetAllSuppliers(SupplierRepository),
        create: new CreateSupplier_1.CreateSupplier(SupplierRepository),
        findById: new FindByIdSupplier_1.FindByIdSupplier(SupplierRepository),
        update: new UpdateSupplier_1.UpdateSupplier(SupplierRepository),
        updateState: new UpdateStateSupplier_1.UpdateStateSupplier(SupplierRepository),
    }
};
//# sourceMappingURL=SupplierServiceContainer.js.map