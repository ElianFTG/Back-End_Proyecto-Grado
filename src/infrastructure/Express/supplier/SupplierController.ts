import { Request, Response } from "express";
import { SupplierServiceContainer } from "../../../shared/service_containers/supplier/SupplierServiceContainer";
import { Supplier } from "../../../domain/supplier/Supplier";

export class SupplierController {
    async getAll(req: Request, res: Response) {
        const suppliers = await SupplierServiceContainer.supplier.getAll.run();
        return res.status(200).json(suppliers);
    }

    async create(req: Request, res: Response) {
        const { nit, name, phone, countryId, address, contactName, userId } = req.body;
        const supplier = await SupplierServiceContainer.supplier.create.run(
            nit,
            name,
            phone,
            countryId,
            address,
            contactName,
            userId
        );
        if (!supplier) return res.status(500).json(null);
        return res.status(201).json(supplier);
    }

    async findById(req: Request, res: Response) {
        const id = Number(req.params.id);
        if (isNaN(id)) return res.status(400).json({ message: 'ID inválido' });

        const supplier = await SupplierServiceContainer.supplier.findById.run(id);
        if (!supplier) return res.status(404).json(null);
        return res.status(200).json(supplier);
    }

    async update(req: Request, res: Response) {
        const id = Number(req.params.id);
        if (isNaN(id)) return res.status(400).json({ message: 'ID inválido' });

        const body = req.body ?? {};
        const userId = body.user_id;
        const supplierPatch: Partial<Supplier> = {
            nit: body.nit,
            name: body.name,
            phone: body.phone,
            countryId: body.countryId,
            address: body.address,
            contactName: body.contactName,
        };

        const updatedSupplier = await SupplierServiceContainer.supplier.update.run(id, supplierPatch, userId);
        return res.status(200).json(updatedSupplier);
    }

    async updateState(req: Request, res: Response) {
        const id = Number(req.params.id);
        if (isNaN(id)) return res.status(400).json({ message: 'ID inválido' });

        const userId = req.body.user_id;
        try {
            await SupplierServiceContainer.supplier.updateState.run(id, userId);
            return res.status(204).send();
        } catch (err) {
            return res.status(500).json({ message: 'Error interno' });
        }
    }
}
