import { Request, Response } from "express";
import { CategoryServiceContainer } from "../../../shared/service_containers/category/CategoryServiceContainer";
import { Category } from "../../../domain/category/Category";

export class CategoryController {
    async getAll(req: Request, res: Response) {
        const categories = await CategoryServiceContainer.category.getAll.run();
        return res.status(200).json(categories);
    }

    async create(req: Request, res: Response) {
        const { name, description, userId } = req.body;
        const category = await CategoryServiceContainer.category.create.run(
            name,
            description,
            userId
        );
        if (!category) return res.status(500).json(null);
        return res.status(201).json(category);
    }

    async findById(req: Request, res: Response) {
        const id = Number(req.params.id);
        if (isNaN(id)) return res.status(400).json({ message: 'ID inválido' });

        const category = await CategoryServiceContainer.category.findById.run(id);
        if (!category) return res.status(404).json(null);
        return res.status(200).json(category);
    }

    async update(req: Request, res: Response) {
        const id = Number(req.params.id);
        if (isNaN(id)) return res.status(400).json({ message: 'ID inválido' });

        const body = req.body ?? {};
        const userId = body.user_id;
        const categoryPatch: Partial<Category> = {
            name: body.name,
            description: body.description,
        };

        const updatedCategory = await CategoryServiceContainer.category.update.run(id, categoryPatch, userId);
        return res.status(200).json(updatedCategory);
    }

    async updateState(req: Request, res: Response) {
        const id = Number(req.params.id);
        if (isNaN(id)) return res.status(400).json({ message: 'ID inválido' });

        const userId = req.body.user_id;
        try {
            await CategoryServiceContainer.category.updateState.run(id, userId);
            return res.status(204).send();
        } catch (err) {
            return res.status(500).json({ message: 'Error interno' });
        }
    }
}
