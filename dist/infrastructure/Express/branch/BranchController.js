"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BranchController = void 0;
const BranchServiceContainer_1 = require("../../../shared/service_containers/branch/BranchServiceContainer");
class BranchController {
    async getAll(req, res) {
        const branches = await BranchServiceContainer_1.BranchServiceContainer.branch.getAll.run();
        return res.status(200).json(branches);
    }
    async create(req, res) {
        const { name, user_id } = req.body ?? {};
        if (!name)
            return res.status(400).json({ message: 'Nombre es obligatorio' });
        const branch = await BranchServiceContainer_1.BranchServiceContainer.branch.create.run(name, user_id);
        if (!branch)
            return res.status(500).json(null);
        return res.status(201).json(branch);
    }
    async findById(req, res) {
        const id = Number(req.params.id);
        if (isNaN(id))
            return res.status(400).json({ message: 'ID inválido' });
        const branch = await BranchServiceContainer_1.BranchServiceContainer.branch.findById.run(id);
        if (!branch)
            return res.status(404).json(null);
        return res.status(200).json(branch);
    }
    async update(req, res) {
        const id = Number(req.params.id);
        if (isNaN(id))
            return res.status(400).json({ message: 'ID inválido' });
        const body = req.body ?? {};
        const userId = body.user_id;
        const patch = {
            name: body.name,
            state: body.state,
        };
        const updated = await BranchServiceContainer_1.BranchServiceContainer.branch.update.run(id, patch, userId);
        return res.status(200).json(updated);
    }
    async updateState(req, res) {
        const id = Number(req.params.id);
        if (isNaN(id))
            return res.status(400).json({ message: 'ID inválido' });
        const userId = req.body.user_id;
        try {
            await BranchServiceContainer_1.BranchServiceContainer.branch.updateState.run(id, userId);
            return res.status(204).send();
        }
        catch (err) {
            return res.status(500).json({ message: 'Error interno' });
        }
    }
}
exports.BranchController = BranchController;
//# sourceMappingURL=BranchController.js.map