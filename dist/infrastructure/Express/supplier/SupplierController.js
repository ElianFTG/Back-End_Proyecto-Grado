"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SupplierController = void 0;
const SupplierServiceContainer_1 = require("../../../shared/service_containers/supplier/SupplierServiceContainer");
class SupplierController {
    async getAll(req, res) {
        const suppliers = await SupplierServiceContainer_1.SupplierServiceContainer.supplier.getAll.run();
        return res.status(200).json(suppliers);
    }
    async create(req, res) {
        const { nit, name, phone, countryId, address, contactName, userId } = req.body;
        const supplier = await SupplierServiceContainer_1.SupplierServiceContainer.supplier.create.run(nit, name, phone, countryId, address, contactName, userId);
        if (!supplier)
            return res.status(500).json(null);
        return res.status(201).json(supplier);
    }
    async findById(req, res) {
        const id = Number(req.params.id);
        if (isNaN(id))
            return res.status(400).json({ message: 'ID inválido' });
        const supplier = await SupplierServiceContainer_1.SupplierServiceContainer.supplier.findById.run(id);
        if (!supplier)
            return res.status(404).json(null);
        return res.status(200).json(supplier);
    }
    async update(req, res) {
        const id = Number(req.params.id);
        if (isNaN(id))
            return res.status(400).json({ message: 'ID inválido' });
        const body = req.body ?? {};
        const userId = body.user_id;
        const supplierPatch = {
            nit: body.nit,
            name: body.name,
            phone: body.phone,
            countryId: body.countryId,
            address: body.address,
            contactName: body.contactName,
        };
        const updatedSupplier = await SupplierServiceContainer_1.SupplierServiceContainer.supplier.update.run(id, supplierPatch, userId);
        return res.status(200).json(updatedSupplier);
    }
    async updateState(req, res) {
        const id = Number(req.params.id);
        if (isNaN(id))
            return res.status(400).json({ message: 'ID inválido' });
        const userId = req.body.user_id;
        try {
            await SupplierServiceContainer_1.SupplierServiceContainer.supplier.updateState.run(id, userId);
            return res.status(204).send();
        }
        catch (err) {
            return res.status(500).json({ message: 'Error interno' });
        }
    }
}
exports.SupplierController = SupplierController;
//# sourceMappingURL=SupplierController.js.map