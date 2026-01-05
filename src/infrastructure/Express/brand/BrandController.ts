import { Request, Response } from "express";
import { BrandServiceContainer } from "../../../shared/service_containers/brand/BrandServiceContainer";
import { Brand } from "../../../domain/brand/Brand";

export class BrandController {
    /**
     * GET /brands
     * Obtiene todas las marcas activas
     */
    async getAll(req: Request, res: Response) {
        const brands = await BrandServiceContainer.brand.getAll.run();
        return res.status(200).json(brands);
    }

    /**
     * POST /brands
     * Body: { "name": "Samsung", "userId": 1 }
     */
    async create(req: Request, res: Response) {
        const { name, userId } = req.body;

        if (!name || !userId) {
            return res.status(400).json({ message: 'name y userId son requeridos' });
        }

        const brand = await BrandServiceContainer.brand.create.run(name, userId);
        if (!brand) return res.status(500).json({ message: 'Error al crear la marca' });
        return res.status(201).json(brand);
    }

    /**
     * GET /brands/:id
     */
    async findById(req: Request, res: Response) {
        const id = Number(req.params.id);
        if (isNaN(id)) return res.status(400).json({ message: 'ID inválido' });

        const brand = await BrandServiceContainer.brand.findById.run(id);
        if (!brand) return res.status(404).json({ message: 'Marca no encontrada' });
        return res.status(200).json(brand);
    }

    /**
     * PATCH /brands/:id
     * Body: { "name": "Sony", "user_id": 1 }
     */
    async update(req: Request, res: Response) {
        const id = Number(req.params.id);
        if (isNaN(id)) return res.status(400).json({ message: 'ID inválido' });

        const body = req.body ?? {};
        const userId = body.user_id;
        const brandPatch: Partial<Brand> = {
            name: body.name,
        };

        const updatedBrand = await BrandServiceContainer.brand.update.run(id, brandPatch, userId);
        if (!updatedBrand) return res.status(404).json({ message: 'Marca no encontrada' });
        return res.status(200).json(updatedBrand);
    }

    /**
     * PATCH /brands/:id/state
     * Body: { "user_id": 1 }
     * Alterna el estado activo/inactivo de la marca
     */
    async updateState(req: Request, res: Response) {
        const id = Number(req.params.id);
        if (isNaN(id)) return res.status(400).json({ message: 'ID inválido' });

        const userId = req.body.user_id;
        try {
            await BrandServiceContainer.brand.updateState.run(id, userId);
            return res.status(204).send();
        } catch (err) {
            return res.status(500).json({ message: 'Error interno' });
        }
    }
}
