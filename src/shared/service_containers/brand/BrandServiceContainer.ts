import { CreateBrand } from "../../../application/brand/CreateBrand";
import { GetAllBrands } from "../../../application/brand/GetAllBrands";
import { FindByIdBrand } from "../../../application/brand/FindByIdBrand";
import { UpdateBrand } from "../../../application/brand/UpdateBrand";
import { UpdateStateBrand } from "../../../application/brand/UpdateStateBrand";
import { MysqlBrandRepository } from "../../../infrastructure/repositories/MysqlBrandRepository";

const BrandRepository = new MysqlBrandRepository();

export const BrandServiceContainer = {
    brand: {
        getAll: new GetAllBrands(BrandRepository),
        create: new CreateBrand(BrandRepository),
        findById: new FindByIdBrand(BrandRepository),
        update: new UpdateBrand(BrandRepository),
        updateState: new UpdateStateBrand(BrandRepository),
    }
};
