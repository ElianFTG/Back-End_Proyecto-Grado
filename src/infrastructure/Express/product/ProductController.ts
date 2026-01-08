import { Request, Response } from "express";
import path from "path";
import fs from "fs/promises";

import { ProductServiceContainer } from "../../../shared/service_containers/product/ProductServiceContainer";
import { Product } from "../../../domain/product/Product";

export class ProductController {
    async getAll(req: Request, res: Response) {
        const filters: { categoryId?: number; brandId?: number; state?: boolean; page?: number; limit?: number; search?: string } = {};

        if (req.query.categoryId) {
            filters.categoryId = Number(req.query.categoryId);
        }
        if (req.query.brandId) {
            filters.brandId = Number(req.query.brandId);
        }
        if (req.query.state !== undefined) {
            filters.state = req.query.state === 'true';
        }
        if (req.query.search) {
            filters.search = String(req.query.search).trim();
        }

        filters.page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
        filters.limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;


        const products = await ProductServiceContainer.product.getAll.run(filters);
        return res.status(200).json(products);
    }


    async create(req: Request, res: Response) {
        const {
            name,
            barcode,
            internalCode,
            presentationId,
            colorId,
            salePrice,

            categoryId,
            brandId,
            userId
        } = req.body;

        if (!name || !salePrice || !categoryId || !brandId || !userId) {
            return res.status(400).json({
                message: 'name, salePrice, categoryId, brandId y userId son requeridos'
            });
        }

        const product = await ProductServiceContainer.product.create.run(
            name,
            salePrice,
            categoryId,
            brandId,
            userId,
            barcode,
            internalCode,
            presentationId ? Number(presentationId) : null,
            colorId ? Number(colorId) : null
        );

        if (!product || !product.id) return res.status(500).json({ message: 'Error al crear el producto' });
        const file = (req as any).file as Express.Multer.File | undefined;
        if (file) {
            try {
                const PROD_IMAGE_DIR_REL = "private/images/products";
                const PROD_IMAGE_DIR_ABS = path.resolve(process.cwd(), PROD_IMAGE_DIR_REL);
                const PROD_IMAGE_PUBLIC_BASE = "/images/products";

                await fs.mkdir(PROD_IMAGE_DIR_ABS, { recursive: true });

                const files = await fs.readdir(PROD_IMAGE_DIR_ABS);
                const prefix = `${product.id}.`;
                const toDelete = files.filter((f) => f.startsWith(prefix));
                await Promise.all(toDelete.map((f) => fs.unlink(path.join(PROD_IMAGE_DIR_ABS, f)).catch(() => undefined)));

                function extFromMimetypeOrName(mimetype?: string, originalname?: string): string {
                    const mime = (mimetype || "").toLowerCase();
                    const name = (originalname || "").toLowerCase();

                    if (mime.includes("jpeg") || name.endsWith(".jpeg") || name.endsWith(".jpg")) return "jpg";
                    if (mime.includes("png") || name.endsWith(".png")) return "png";
                    if (mime.includes("webp") || name.endsWith(".webp")) return "webp";

                    return "jpg";
                }

                const ext = extFromMimetypeOrName(file.mimetype, file.originalname);
                const filename = `${product.id}.${ext}`;
                const destAbs = path.join(PROD_IMAGE_DIR_ABS, filename);

                await fs.writeFile(destAbs, file.buffer);

                const publicPath = `${PROD_IMAGE_PUBLIC_BASE}/${filename}`;

                const userIdForUpdate = (req.body && req.body.userId) ? Number(req.body.userId) : null;
                try {
                    await ProductServiceContainer.product.update.run(product.id, { pathImage: publicPath } as any, userIdForUpdate as any);
                } catch (err) {
                    return res.status(201).json({
                        message: 'Producto creado, pero falló guardar ruta de imagen',
                        product,
                        error: String(err)
                    });
                }
            } catch (err) {
                return res.status(500).json({ message: 'Producto creado, pero falló el guardado de la imagen', error: String(err) });
            }
        }

        const finalProduct = await ProductServiceContainer.product.findById.run(product.id);
        return res.status(201).json(finalProduct ?? product);
    }

    async findById(req: Request, res: Response) {
        const id = Number(req.params.id);
        if (isNaN(id)) return res.status(400).json({ message: 'ID inválido' });

        const product = await ProductServiceContainer.product.findById.run(id);
        if (!product) return res.status(404).json({ message: 'Producto no encontrado' });
        return res.status(200).json(product);
    }

    async update(req: Request, res: Response) {
        const id = Number(req.params.id);
        if (isNaN(id)) return res.status(400).json({ message: 'ID inválido' });

        const body = req.body ?? {};
        const userId = body.user_id;

        const productPatch: Partial<Product> = {};
        if (body.name !== undefined) productPatch.name = body.name;
        if (body.barcode !== undefined) productPatch.barcode = body.barcode;
        if (body.internalCode !== undefined) productPatch.internalCode = body.internalCode;
        if (body.presentationId !== undefined) productPatch.presentationId = body.presentationId ? Number(body.presentationId) : null;
        if (body.colorId !== undefined) productPatch.colorId = body.colorId ? Number(body.colorId) : null;
        if (body.salePrice !== undefined) productPatch.salePrice = body.salePrice;
        if (body.categoryId !== undefined) productPatch.categoryId = body.categoryId;
        if (body.brandId !== undefined) productPatch.brandId = body.brandId;

        const file = (req as any).file as Express.Multer.File | undefined;
        if (file) {
            try {
                const PROD_IMAGE_DIR_REL = "private/images/products";
                const PROD_IMAGE_DIR_ABS = path.resolve(process.cwd(), PROD_IMAGE_DIR_REL);
                const PROD_IMAGE_PUBLIC_BASE = "/images/products";

                await fs.mkdir(PROD_IMAGE_DIR_ABS, { recursive: true });

                const files = await fs.readdir(PROD_IMAGE_DIR_ABS);
                const prefix = `${id}.`;
                const toDelete = files.filter((f) => f.startsWith(prefix));
                await Promise.all(toDelete.map((f) => fs.unlink(path.join(PROD_IMAGE_DIR_ABS, f)).catch(() => undefined)));

                function extFromMimetypeOrName(mimetype?: string, originalname?: string): string {
                    const mime = (mimetype || "").toLowerCase();
                    const name = (originalname || "").toLowerCase();

                    if (mime.includes("jpeg") || name.endsWith(".jpeg") || name.endsWith(".jpg")) return "jpg";
                    if (mime.includes("png") || name.endsWith(".png")) return "png";
                    if (mime.includes("webp") || name.endsWith(".webp")) return "webp";

                    return "jpg";
                }

                const ext = extFromMimetypeOrName(file.mimetype, file.originalname);
                const filename = `${id}.${ext}`;
                const destAbs = path.join(PROD_IMAGE_DIR_ABS, filename);

                await fs.writeFile(destAbs, file.buffer);

                const publicPath = `${PROD_IMAGE_PUBLIC_BASE}/${filename}`;

                productPatch.pathImage = publicPath as any;
            } catch (err) {
                return res.status(500).json({ message: 'Falló el guardado de la imagen', error: String(err) });
            }
        }

        const updatedProduct = await ProductServiceContainer.product.update.run(id, productPatch, userId);
        if (!updatedProduct) return res.status(404).json({ message: 'Producto no encontrado' });
        return res.status(200).json(updatedProduct);
    }

    async updateState(req: Request, res: Response) {
        const id = Number(req.params.id);
        if (isNaN(id)) return res.status(400).json({ message: 'ID inválido' });

        const userId = req.body.user_id;
        try {
            await ProductServiceContainer.product.updateState.run(id, userId);
            return res.status(204).send();
        } catch (err) {
            return res.status(500).json({ message: 'Error interno' });
        }
    }

    async setStock(req: Request, res: Response) {
        const productId = Number(req.params.id);
        const branchId = Number(req.params.branchId);

        if (isNaN(productId) || isNaN(branchId)) {
            return res.status(400).json({ message: 'IDs inválidos' });
        }

        const { has_stock, stock_qty } = req.body;

        if (has_stock === undefined) {
            return res.status(400).json({ message: 'has_stock es requerido' });
        }

        const product = await ProductServiceContainer.product.findById.run(productId);
        if (!product) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }

        const result = await ProductServiceContainer.productBranch.setStock.run(
            productId,
            branchId,
            has_stock,
            stock_qty
        );

        if (!result.success) {
            return res.status(500).json({ message: 'Error al actualizar el stock' });
        }

        return res.status(200).json({
            message: result.deleted
                ? 'Stock removido (producto no disponible en sucursal)'
                : 'Stock actualizado correctamente',
            productId,
            branchId,
            hasStock: result.hasStock,
            stockQty: result.stockQty,
            deleted: result.deleted ?? false
        });
    }

    async getProductsByBranch(req: Request, res: Response) {
        const branchId = Number(req.params.branchId);
        if (isNaN(branchId)) {
            return res.status(400).json({ message: 'ID de sucursal inválido' });
        }

        const search = String(req.query.search || '').trim();
        const page = Math.max(1, parseInt(String(req.query.page || '1'), 10) || 1);
        const limit = Math.min(100, Math.max(1, parseInt(String(req.query.limit || '50'), 10) || 50));
        const onlyAvailable = req.query.onlyAvailable === 'true';
        const categoryId = req.query.categoryId ? Number(req.query.categoryId) : undefined;
        const brandId = req.query.brandId ? Number(req.query.brandId) : undefined;

        const result = await ProductServiceContainer.productBranch.getByBranch.runPaginated({
            branchId,
            search,
            page,
            limit,
            onlyAvailable,
            categoryId,
            brandId
        });

        return res.status(200).json(result);
    }
}

