import { CreateProduct } from "../../../application/product/CreateProduct";
import { GetAllProducts } from "../../../application/product/GetAllProducts";
import { FindByIdProduct } from "../../../application/product/FindByIdProduct";
import { UpdateProduct } from "../../../application/product/UpdateProduct";
import { UpdateStateProduct } from "../../../application/product/UpdateStateProduct";
import { SetProductStockByBranch } from "../../../application/product_branch/SetProductStockByBranch";
import { GetProductsByBranch } from "../../../application/product_branch/GetProductsByBranch";
import { MysqlProductRepository } from "../../../infrastructure/repositories/MysqlProductRepository";
import { MysqlProductBranchRepository } from "../../../infrastructure/repositories/MysqlProductBranchRepository";

const ProductRepository = new MysqlProductRepository();
const ProductBranchRepository = new MysqlProductBranchRepository();

export const ProductServiceContainer = {
    product: {
        getAll: new GetAllProducts(ProductRepository),
        create: new CreateProduct(ProductRepository),
        findById: new FindByIdProduct(ProductRepository),
        update: new UpdateProduct(ProductRepository),
        updateState: new UpdateStateProduct(ProductRepository),
    },
    productBranch: {
        setStock: new SetProductStockByBranch(ProductBranchRepository),
        getByBranch: new GetProductsByBranch(ProductBranchRepository),
    }
};
