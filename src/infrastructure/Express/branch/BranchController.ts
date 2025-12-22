import { Request, Response } from "express";
import { BranchServiceContainer } from "../../../shared/service_containers/branch/BranchServiceContainer";
import { Branch } from "../../../domain/branch/Branch";

export class BranchController {
    async getAll(req: Request, res: Response) {
        const branches = await BranchServiceContainer.branch.getAll.run();
        return res.status(200).json(branches);
    }

    async create(req: Request, res: Response) {
        const { name, user_id } = req.body ?? {};
        if (!name) return res.status(400).json({ message: 'Nombre es obligatorio' });
        const branch = await BranchServiceContainer.branch.create.run(name, user_id);
        if (!branch) return res.status(500).json(null);
        return res.status(201).json(branch);
    }

    async findById(req: Request, res: Response) {
        const id = Number(req.params.id);
        if (isNaN(id)) return res.status(400).json({ message: 'ID inválido' });

        const branch = await BranchServiceContainer.branch.findById.run(id);
        if (!branch) return res.status(404).json(null);
        return res.status(200).json(branch);
    }

    async update(req: Request, res: Response) {
        const id = Number(req.params.id);
        if (isNaN(id)) return res.status(400).json({ message: 'ID inválido' });

        const body = req.body ?? {};
        const userId = body.user_id;
        const patch: Partial<Branch> = {
            name: body.name,
            state: body.state,
        };

        const updated = await BranchServiceContainer.branch.update.run(id, patch, userId);
        return res.status(200).json(updated);
    }

    async updateState(req: Request, res: Response) {
        const id = Number(req.params.id);
        if (isNaN(id)) return res.status(400).json({ message: 'ID inválido' });

        const userId = req.body.user_id;
        try {
            await BranchServiceContainer.branch.updateState.run(id, userId);
            return res.status(204).send();
        } catch (err) {
            return res.status(500).json({ message: 'Error interno' });
        }
    }
}
