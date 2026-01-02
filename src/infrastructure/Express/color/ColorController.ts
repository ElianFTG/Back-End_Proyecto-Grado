import { Request, Response } from "express";
import { ColorServiceContainer } from "../../../shared/service_containers/color";
import { Color } from "../../../domain/color/Color";

export class ColorController {
    async getAll(req: Request, res: Response) {
        const colors = await ColorServiceContainer.color.getAll.run();
        return res.status(200).json(colors);
    }

    async create(req: Request, res: Response) {
        const { name, userId } = req.body;
        const color = await ColorServiceContainer.color.create.run(
            name,
            userId
        );
        if (!color) return res.status(500).json(null);
        return res.status(201).json(color);
    }

    async findById(req: Request, res: Response) {
        const id = Number(req.params.id);
        if (isNaN(id)) return res.status(400).json({ message: 'ID inválido' });

        const color = await ColorServiceContainer.color.findById.run(id);
        if (!color) return res.status(404).json(null);
        return res.status(200).json(color);
    }

    async update(req: Request, res: Response) {
        const id = Number(req.params.id);
        if (isNaN(id)) return res.status(400).json({ message: 'ID inválido' });

        const body = req.body ?? {};
        const userId = body.user_id;
        const colorPatch: Partial<Color> = {
            name: body.name,
        };

        const updatedColor = await ColorServiceContainer.color.update.run(id, colorPatch, userId);
        return res.status(200).json(updatedColor);
    }

    async updateState(req: Request, res: Response) {
        const id = Number(req.params.id);
        if (isNaN(id)) return res.status(400).json({ message: 'ID inválido' });

        const userId = req.body.user_id;
        try {
            await ColorServiceContainer.color.updateState.run(id, userId);
            return res.status(204).send();
        } catch (err) {
            return res.status(500).json({ message: 'Error interno' });
        }
    }
}
