import { Request, Response } from "express";
import { PresentationServiceContainer } from "../../../shared/service_containers/presentation";
import { Presentation } from "../../../domain/presentation/Presentation";

export class PresentationController {
    async getAll(req: Request, res: Response) {
        const presentations = await PresentationServiceContainer.presentation.getAll.run();
        return res.status(200).json(presentations);
    }

    async create(req: Request, res: Response) {
        const { name, userId } = req.body;
        const presentation = await PresentationServiceContainer.presentation.create.run(
            name,
            userId
        );
        if (!presentation) return res.status(500).json(null);
        return res.status(201).json(presentation);
    }

    async findById(req: Request, res: Response) {
        const id = Number(req.params.id);
        if (isNaN(id)) return res.status(400).json({ message: 'ID inválido' });

        const presentation = await PresentationServiceContainer.presentation.findById.run(id);
        if (!presentation) return res.status(404).json(null);
        return res.status(200).json(presentation);
    }

    async update(req: Request, res: Response) {
        const id = Number(req.params.id);
        if (isNaN(id)) return res.status(400).json({ message: 'ID inválido' });

        const body = req.body ?? {};
        const userId = body.user_id;
        const presentationPatch: Partial<Presentation> = {
            name: body.name,
        };

        const updatedPresentation = await PresentationServiceContainer.presentation.update.run(id, presentationPatch, userId);
        return res.status(200).json(updatedPresentation);
    }

    async updateState(req: Request, res: Response) {
        const id = Number(req.params.id);
        if (isNaN(id)) return res.status(400).json({ message: 'ID inválido' });

        const userId = req.body.user_id;
        try {
            await PresentationServiceContainer.presentation.updateState.run(id, userId);
            return res.status(204).send();
        } catch (err) {
            return res.status(500).json({ message: 'Error interno' });
        }
    }
}
