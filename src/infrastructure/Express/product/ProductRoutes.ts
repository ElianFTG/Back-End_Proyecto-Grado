import { Router } from "express";
import multer from "multer";
import { ProductController } from "./ProductController";

const controller = new ProductController();

const ProductRouter = Router();

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 8 * 1024 * 1024 } });

// CRUD de productos
ProductRouter.get("/products", controller.getAll.bind(controller));
ProductRouter.post("/products", upload.single("image"), controller.create.bind(controller));
ProductRouter.get("/products/:id", controller.findById.bind(controller));
ProductRouter.patch("/products/:id", upload.single("image"), controller.update.bind(controller));
ProductRouter.patch("/products/:id/state", controller.updateState.bind(controller));

// Stock por sucursal
ProductRouter.put("/products/:id/branches/:branchId/stock", controller.setStock.bind(controller));

// Productos por sucursal
ProductRouter.get("/branches/:branchId/products", controller.getProductsByBranch.bind(controller));

export { ProductRouter };
