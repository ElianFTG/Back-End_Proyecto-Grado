import { Request, Response } from "express";
import path from "path";
import fs from "fs/promises";

import { ProductServiceContainer } from "../../../shared/service_containers/product/ProductServiceContainer";
import { Product } from "../../../domain/product/Product";

// Note: image URL handling has been removed — products no longer expose `urlImage`.

export class ProductController {
    /**
     * GET /products
     * Query params opcionales: categoryId, brandId, state
     * Ejemplo: /products?categoryId=1&brandId=2&state=true
     */
    async getAll(req: Request, res: Response) {
        const filters: { categoryId?: number; brandId?: number; state?: boolean; page?: number, limit?: number } = {};

        if (req.query.categoryId) {
            filters.categoryId = Number(req.query.categoryId);
        }
        if (req.query.brandId) {
            filters.brandId = Number(req.query.brandId);
        }
        if (req.query.state !== undefined) {
            filters.state = req.query.state === 'true';
        }

        filters.page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
        filters.limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;


        const products = await ProductServiceContainer.product.getAll.run(filters);
        return res.status(200).json(products);
    }


    /**
     * POST /products
     * Body: {
     *   "name": "Cable HDMI 2m",
     *   "barcode": "123456789012",
     *   "internalCode": "CAB-HDMI-2M",
     *   "presentationId": 1,
     *   "colorId": 2,
     *   "salePrice": { "mayorista": 10.5, "minorista": 12.0, "regular": 11.0 },
     *   "categoryId": 1,
     *   "brandId": 1,
     *   "userId": 1
     * }
     */
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
        // Manejo de imagen (si se subió)
        const file = (req as any).file as Express.Multer.File | undefined;
        if (file) {
            try {
                const PROD_IMAGE_DIR_REL = "private/images/products";
                const PROD_IMAGE_DIR_ABS = path.resolve(process.cwd(), PROD_IMAGE_DIR_REL);
                const PROD_IMAGE_PUBLIC_BASE = "/images/products";

                await fs.mkdir(PROD_IMAGE_DIR_ABS, { recursive: true });

                // Eliminar imágenes previas con prefijo id.
                const files = await fs.readdir(PROD_IMAGE_DIR_ABS);
                const prefix = `${product.id}.`;
                const toDelete = files.filter((f) => f.startsWith(prefix));
                await Promise.all(toDelete.map((f) => fs.unlink(path.join(PROD_IMAGE_DIR_ABS, f)).catch(() => undefined)));

                // determinar extensión
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

                // Guardar path en producto (patch vía servicio)
                const userIdForUpdate = (req.body && req.body.userId) ? Number(req.body.userId) : null;
                try {
                    await ProductServiceContainer.product.update.run(product.id, { pathImage: publicPath } as any, userIdForUpdate as any);
                } catch (err) {
                    // Si falla la actualización, respondemos con warning pero producto creado
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

    /**
     * GET /products/:id
     */
    async findById(req: Request, res: Response) {
        const id = Number(req.params.id);
        if (isNaN(id)) return res.status(400).json({ message: 'ID inválido' });

        const product = await ProductServiceContainer.product.findById.run(id);
        if (!product) return res.status(404).json({ message: 'Producto no encontrado' });
        return res.status(200).json(product);
    }

    /**
     * PATCH /products/:id
     * Body: { "name": "Nuevo nombre", "salePrice": {...}, "user_id": 1 }
     */
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

        // Manejo de imagen (si se subió)
        const file = (req as any).file as Express.Multer.File | undefined;
        if (file) {
            try {
                const PROD_IMAGE_DIR_REL = "private/images/products";
                const PROD_IMAGE_DIR_ABS = path.resolve(process.cwd(), PROD_IMAGE_DIR_REL);
                const PROD_IMAGE_PUBLIC_BASE = "/images/products";

                await fs.mkdir(PROD_IMAGE_DIR_ABS, { recursive: true });

                // Eliminar imágenes previas con prefijo id.
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

    /**
     * PATCH /products/:id/state
     * Body: { "user_id": 1 }
     * Alterna el estado activo/inactivo del producto
     */
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

    /**
     * PUT /products/:id/branches/:branchId/stock
     * Body: { "has_stock": boolean, "stock_qty": number|null }
     * UPSERT optimizado:
     * - Si has_stock=true: inserta o actualiza
     * - Si has_stock=false: elimina la fila para mantener tabla pequeña
     */
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

        // Validar que el producto existe
        const product = await ProductServiceContainer.product.findById.run(productId);
        if (!product) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }

        // Usar método optimizado (UPSERT + DELETE)
        const result = await ProductServiceContainer.productBranch.setStock.runOptimized(
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
            hasStock: has_stock,
            stockQty: has_stock ? (stock_qty ?? null) : null,
            deleted: result.deleted ?? false
        });
    }

    /**
     * GET /branches/:branchId/products
     * Endpoint paginado y optimizado para grandes volúmenes (~30.000 productos)
     * 
     * Query params:
     * - search: string (busca en nombre, barcode, internal_code)
     * - page: number (default: 1)
     * - limit: number (default: 50, max: 100)
     * - onlyAvailable: boolean (default: false)
     *   - true: solo productos con stock en esta sucursal
     *   - false: todos los productos activos con info de stock
     * - categoryId: number (opcional)
     * - brandId: number (opcional)
     * 
     * Respuesta:
     * {
     *   data: ProductWithBranchInfo[],
     *   page: number,
     *   limit: number,
     *   total: number,
     *   totalPages: number
     * }
     */
    async getProductsByBranch(req: Request, res: Response) {
        const branchId = Number(req.params.branchId);
        if (isNaN(branchId)) {
            return res.status(400).json({ message: 'ID de sucursal inválido' });
        }

        // Parsear query params con valores por defecto
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

