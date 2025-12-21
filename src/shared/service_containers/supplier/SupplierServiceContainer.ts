import { CreateSupplier } from "../../../application/supplier/CreateSupplier";
import { GetAllSuppliers } from "../../../application/supplier/GetAllSuppliers";
import { FindByIdSupplier } from "../../../application/supplier/FindByIdSupplier";
import { UpdateSupplier } from "../../../application/supplier/UpdateSupplier";
import { UpdateStateSupplier } from "../../../application/supplier/UpdateStateSupplier";
import { MysqlSupplierRepository } from "../../../infrastructure/repositories/MysqlSupplierRepository";

const SupplierRepository = new MysqlSupplierRepository();

export const SupplierServiceContainer = {
    supplier: {
        getAll: new GetAllSuppliers(SupplierRepository),
        create: new CreateSupplier(SupplierRepository),
        findById: new FindByIdSupplier(SupplierRepository),
        update: new UpdateSupplier(SupplierRepository),
        updateState: new UpdateStateSupplier(SupplierRepository),
    }
}
