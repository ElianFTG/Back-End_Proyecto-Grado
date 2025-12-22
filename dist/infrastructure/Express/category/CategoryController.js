"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryController = void 0;
const CategoryServiceContainer_1 = require("../../../shared/service_containers/category/CategoryServiceContainer");
class CategoryController {
    async getAll(req, res) {
        const categories = await CategoryServiceContainer_1.CategoryServiceContainer.category.getAll.run();
        return res.status(200).json(categories);
    }
    async create(req, res) {
        const { name, description, userId } = req.body;
        const category = await CategoryServiceContainer_1.CategoryServiceContainer.category.create.run(name, description, userId);
        if (!category)
            return res.status(500).json(null);
        return res.status(201).json(category);
    }
    async findById(req, res) {
        const id = Number(req.params.id);
        if (isNaN(id))
            return res.status(400).json({ message: 'ID inválido' });
        const category = await CategoryServiceContainer_1.CategoryServiceContainer.category.findById.run(id);
        if (!category)
            return res.status(404).json(null);
        return res.status(200).json(category);
    }
    async update(req, res) {
        const id = Number(req.params.id);
        if (isNaN(id))
            return res.status(400).json({ message: 'ID inválido' });
        const body = req.body ?? {};
        const userId = body.user_id;
        const categoryPatch = {
            name: body.name,
            description: body.description,
        };
        const updatedCategory = await CategoryServiceContainer_1.CategoryServiceContainer.category.update.run(id, categoryPatch, userId);
        return res.status(200).json(updatedCategory);
    }
    async updateState(req, res) {
        const id = Number(req.params.id);
        if (isNaN(id))
            return res.status(400).json({ message: 'ID inválido' });
        const userId = req.body.user_id;
        try {
            await CategoryServiceContainer_1.CategoryServiceContainer.category.updateState.run(id, userId);
            return res.status(204).send();
        }
        catch (err) {
            return res.status(500).json({ message: 'Error interno' });
        }
    }
}
exports.CategoryController = CategoryController;
//# sourceMappingURL=CategoryController.js.map